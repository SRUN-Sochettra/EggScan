package com.eggscan.service;

import com.eggscan.model.GitHubRepo;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.*;

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

        // ⚡ Bolt Optimization: Use flatMapSequential to execute independent WebClient calls
        // concurrently instead of sequentially blocking, reducing latency from O(n) to O(1).
        List<Map.Entry<String, String>> entries = Flux.fromIterable(top)
                .flatMapSequential(r -> fetchReadmeMono(username, r.getName())
                        .map(content -> (Map.Entry<String, String>) new AbstractMap.SimpleEntry<>(r.getName(), content)))
                .collectList()
                .block();

        Map<String, String> out = new LinkedHashMap<>();
        if (entries != null) {
            for (Map.Entry<String, String> entry : entries) {
                out.put(entry.getKey(), entry.getValue());
            }
        }
        return out;
    }

    public int countReposWithReadme(Map<String, String> readmes) {
        return (int) readmes.values().stream().filter(v -> v != null && !v.isBlank()).count();
    }

    private Mono<String> fetchReadmeMono(String username, String repo) {
        return client.get()
                .uri("/repos/{u}/{r}/readme", username, repo)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .map(resp -> {
                    String b64 = resp.path("content").asText("");
                    if (b64.isBlank()) return "";
                    String decoded = new String(Base64.getMimeDecoder().decode(b64));
                    // Truncate aggressively — we only feed a snippet to the AI
                    return decoded.length() > 1500 ? decoded.substring(0, 1500) : decoded;
                })
                .onErrorReturn("");
    }
}