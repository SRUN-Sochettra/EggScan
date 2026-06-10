package com.eggscan.service;

import com.eggscan.model.GitHubProfile;
import com.eggscan.model.GitHubRepo;
import com.eggscan.model.ScanResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GitHubServiceTest {

    @Mock
    private WebClient webClient;

    @Mock
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;

    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    private GitHubService gitHubService;

    @BeforeEach
    void setUp() {
        gitHubService = new GitHubService(webClient);
    }

    private void mockWebClient(GitHubProfile profile, GitHubRepo[] repos) {
        // Mock profile fetch
        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(eq("/users/{u}"), anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);

        if (profile != null) {
            when(responseSpec.bodyToMono(GitHubProfile.class)).thenReturn(Mono.just(profile));
        } else {
            when(responseSpec.bodyToMono(GitHubProfile.class)).thenReturn(Mono.error(new RuntimeException("User not found")));
        }

        // Mock repos fetch
        when(requestHeadersUriSpec.uri(eq("/users/{u}/repos?per_page=100&sort=updated"), anyString())).thenReturn(requestHeadersSpec);

        if (repos != null) {
            when(responseSpec.bodyToMono(GitHubRepo[].class)).thenReturn(Mono.just(repos));
        } else {
            // It could return an empty Mono if not found, but based on code, null repos throws or handles differently
            when(responseSpec.bodyToMono(GitHubRepo[].class)).thenReturn(Mono.empty());
        }
    }

    @Test
    void scanUser_HappyPath() {
        // Arrange
        GitHubProfile profile = new GitHubProfile();
        profile.setLogin("testuser");

        GitHubRepo repo1 = new GitHubRepo();
        repo1.setFork(false);
        repo1.setLanguage("Java");
        repo1.setStargazers_count(10);
        repo1.setPushed_at(Instant.now().toString());

        GitHubRepo repo2 = new GitHubRepo();
        repo2.setFork(false);
        repo2.setLanguage("Java");
        repo2.setStargazers_count(5);
        repo2.setPushed_at(Instant.now().minus(10, ChronoUnit.DAYS).toString());

        GitHubRepo forkRepo = new GitHubRepo();
        forkRepo.setFork(true);
        forkRepo.setLanguage("Python");
        forkRepo.setStargazers_count(100);

        GitHubRepo[] repos = {repo1, repo2, forkRepo};

        mockWebClient(profile, repos);

        // Act
        ScanResult result = gitHubService.scanUser("testuser");

        // Assert
        assertNotNull(result);
        assertEquals("testuser", result.getProfile().getLogin());
        assertEquals(2, result.getRepos().size(), "Forks should be filtered out");

        assertEquals(1, result.getLanguageBreakdown().size());
        assertEquals(2, result.getLanguageBreakdown().get("Java"));

        assertEquals(15, result.getTotalStars());
        assertEquals(2, result.getActiveRepos());
        assertNotEquals("never", result.getLastActivity());
    }

    @Test
    void scanUser_UserNotFound() {
        // Arrange
        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(eq("/users/{u}"), anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);

        // Emulate error from WebClient (e.g. 404 Not Found)
        when(responseSpec.bodyToMono(GitHubProfile.class)).thenReturn(Mono.error(new RuntimeException("404 Not Found")));

        // Act & Assert
        // The service intercepts the error and wraps it in a RuntimeException with "User not found: <username>"
        RuntimeException exception = assertThrows(RuntimeException.class, () -> gitHubService.scanUser("unknownuser"));
        assertTrue(exception.getMessage().contains("User not found: unknownuser"));
    }

    @Test
    void scanUser_NoRepos() {
        // Arrange
        GitHubProfile profile = new GitHubProfile();
        profile.setLogin("testuser");

        mockWebClient(profile, new GitHubRepo[0]);

        // Act
        ScanResult result = gitHubService.scanUser("testuser");

        // Assert
        assertNotNull(result);
        assertTrue(result.getRepos().isEmpty());
        assertTrue(result.getLanguageBreakdown().isEmpty());
        assertEquals(0, result.getTotalStars());
        assertEquals(0, result.getActiveRepos());
        assertEquals("never", result.getLastActivity());
    }

    @Test
    void scanUser_NullLanguagesAndStars() {
        // Arrange
        GitHubProfile profile = new GitHubProfile();
        profile.setLogin("testuser");

        GitHubRepo repo = new GitHubRepo();
        repo.setFork(false);
        repo.setLanguage(null);
        repo.setStargazers_count(null);
        repo.setPushed_at(null);

        GitHubRepo[] repos = {repo};

        mockWebClient(profile, repos);

        // Act
        ScanResult result = gitHubService.scanUser("testuser");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getRepos().size());
        assertTrue(result.getLanguageBreakdown().isEmpty());
        assertEquals(0, result.getTotalStars());
        assertEquals(0, result.getActiveRepos());
        assertEquals("never", result.getLastActivity());
    }
}