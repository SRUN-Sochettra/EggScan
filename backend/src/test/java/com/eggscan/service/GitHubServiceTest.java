package com.eggscan.service;

import com.eggscan.model.GitHubProfile;
import com.eggscan.model.GitHubRepo;
import com.eggscan.model.ScanResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class GitHubServiceTest {

    private MockWebServer mockWebServer;
    private GitHubService gitHubService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();

        WebClient webClient = WebClient.builder()
                .baseUrl(mockWebServer.url("/").toString())
                .build();

        gitHubService = new GitHubService(webClient);
        objectMapper = new ObjectMapper();
    }

    @AfterEach
    void tearDown() throws IOException {
        mockWebServer.shutdown();
    }

    private GitHubRepo createRepo(String pushedAt) {
        GitHubRepo repo = new GitHubRepo();
        repo.setFork(false);
        repo.setPushed_at(pushedAt);
        return repo;
    }

    @Test
    void testActiveRepos_EdgeCases() throws Exception {
        // Prepare dummy profile response
        GitHubProfile dummyProfile = new GitHubProfile();
        dummyProfile.setLogin("testuser");

        // Pushed dates:
        // 1. null -> not active
        // 2. 10 days ago -> active
        // 3. exactly 180 days ago -> not active (must be AFTER)
        // 4. 200 days ago -> not active
        Instant now = Instant.now();
        String activeDate = now.minus(10, ChronoUnit.DAYS).toString();
        String exactly180DaysAgo = now.minus(180, ChronoUnit.DAYS).toString();
        String oldDate = now.minus(200, ChronoUnit.DAYS).toString();

        GitHubRepo repoNull = createRepo(null);
        GitHubRepo repoActive = createRepo(activeDate);
        GitHubRepo repoExactly180 = createRepo(exactly180DaysAgo);
        GitHubRepo repoOld = createRepo(oldDate);

        List<GitHubRepo> repos = List.of(repoNull, repoActive, repoExactly180, repoOld);

        // Enqueue profile response
        mockWebServer.enqueue(new MockResponse()
                .setBody(objectMapper.writeValueAsString(dummyProfile))
                .addHeader("Content-Type", "application/json"));

        // Enqueue repos response
        mockWebServer.enqueue(new MockResponse()
                .setBody(objectMapper.writeValueAsString(repos))
                .addHeader("Content-Type", "application/json"));

        ScanResult result = gitHubService.scanUser("testuser");

        // activeRepos count should only be 1 (the one pushed 10 days ago)
        assertEquals(1, result.getActiveRepos(), "Only 1 repo should be considered active");

        // Let's also check the latest activity
        assertEquals(activeDate, result.getLastActivity());
    }
}
