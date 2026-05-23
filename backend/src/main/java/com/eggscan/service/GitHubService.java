package com.eggscan.service;

import com.eggscan.model.GitHubProfile;
import com.eggscan.model.GitHubRepo;
import com.eggscan.model.ScanResult;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GitHubService {

    private final WebClient client;

    public GitHubService(@org.springframework.beans.factory.annotation.Qualifier("githubClient") WebClient githubClient) {
        this.client = githubClient;
    }

    public ScanResult scanUser(String username) {
        GitHubProfile profile = fetchProfile(username);
        List<GitHubRepo> repos = fetchRepos(username);

        // Filter out forks for skill analysis
        List<GitHubRepo> ownRepos = repos.stream()
                .filter(r -> !Boolean.TRUE.equals(r.getFork()))
                .toList();

        Map<String, Integer> langs = ownRepos.stream()
                .filter(r -> r.getLanguage() != null)
                .collect(Collectors.groupingBy(
                        GitHubRepo::getLanguage,
                        Collectors.summingInt(r -> 1)
                ));

        int totalStars = ownRepos.stream()
                .mapToInt(r -> Optional.ofNullable(r.getStargazers_count()).orElse(0))
                .sum();

        int activeRepos = (int) ownRepos.stream()
                .filter(this::isActive)
                .count();

        String lastActivity = ownRepos.stream()
                .map(GitHubRepo::getPushed_at)
                .filter(Objects::nonNull)
                .max(Comparator.naturalOrder())
                .orElse("never");

        return ScanResult.builder()
                .profile(profile)
                .repos(ownRepos)
                .languageBreakdown(langs)
                .totalStars(totalStars)
                .activeRepos(activeRepos)
                .reposWithReadme(0) // placeholder — we'll fetch READMEs in Phase 2
                .lastActivity(lastActivity)
                .build();
    }

    private boolean isActive(GitHubRepo repo) {
        if (repo.getPushed_at() == null) return false;
        Instant pushed = Instant.parse(repo.getPushed_at());
        return pushed.isAfter(Instant.now().minus(180, ChronoUnit.DAYS));
    }

    private GitHubProfile fetchProfile(String username) {
        return client.get()
                .uri("/users/{u}", username)
                .retrieve()
                .bodyToMono(GitHubProfile.class)
                .onErrorResume(e -> Mono.error(new RuntimeException("User not found: " + username)))
                .block();
    }

    private List<GitHubRepo> fetchRepos(String username) {
        GitHubRepo[] repos = client.get()
                .uri("/users/{u}/repos?per_page=100&sort=updated", username)
                .retrieve()
                .bodyToMono(GitHubRepo[].class)
                .block();
        return repos == null ? List.of() : Arrays.asList(repos);
    }
}