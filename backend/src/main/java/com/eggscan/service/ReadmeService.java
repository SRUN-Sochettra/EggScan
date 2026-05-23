package com.eggscan.service;

import com.eggscan.model.GitHubRepo;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReadmeService {

    private final WebClient client;

    public ReadmeService(@Qualifier("githubClient") WebClient githubClient) {
        this.client = githubClient;
    }

    /**
     * Fetches READMEs for top N repos (by stars/recency).
     * Returns a map: repoName -> truncated README text.
     */
    public Map<String, String> fetchTopReadmes(String username, List<GitHubRepo> repos, int n) {
        List<GitHubRepo> top = repos.stream()
                .sorted(Comparator
                        .comparingInt((GitHubRepo r) -> Optional.ofNullable(r.getStargazers_count()).orElse(0))
                        .reversed()
                        .thenComparing(GitHubRepo::getPushed_at, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(n)
                .toList();

        Map<String, String> out = new LinkedHashMap<>();
        for (GitHubRepo r : top) {
            String content = fetchReadme(username, r.getName());
            out.put(r.getName(), content); // may be empty string
        }
        return out;
    }

    public int countReposWithReadme(Map<String, String> readmes) {
        return (int) readmes.values().stream().filter(v -> v != null && !v.isBlank()).count();
    }

    private String fetchReadme(String username, String repo) {
        try {
            JsonNode resp = client.get()
                    .uri("/repos/{u}/{r}/readme", username, repo)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            String b64 = resp.path("content").asText("");
            if (b64.isBlank()) return "";
            String decoded = new String(Base64.getMimeDecoder().decode(b64));
            // Truncate aggressively — we only feed a snippet to the AI
            return decoded.length() > 1500 ? decoded.substring(0, 1500) : decoded;
        } catch (Exception e) {
            return "";
        }
    }
}