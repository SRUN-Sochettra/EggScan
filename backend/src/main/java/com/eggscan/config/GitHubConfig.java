package com.eggscan.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class GitHubConfig {

    @Value("${github.token}")
    private String token;

    @Value("${github.api-url}")
    private String apiUrl;

    @Value("${github.graphql-url}")
    private String graphqlUrl;

    @Bean
    @Qualifier("githubClient")
    public WebClient githubClient() {
        return WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader("Authorization", "Bearer " + token)
                .defaultHeader("Accept", "application/vnd.github+json")
                .defaultHeader("X-GitHub-Api-Version", "2022-11-28")
                .defaultHeader("User-Agent", "EggScan")
                .codecs(c -> c.defaultCodecs().maxInMemorySize(4 * 1024 * 1024))
                .build();
    }

    @Bean
    @Qualifier("githubGraphQLClient")
    public WebClient githubGraphQLClient() {
        return WebClient.builder()
                .baseUrl(graphqlUrl)
                .defaultHeader("Authorization", "Bearer " + token)
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("User-Agent", "EggScan")
                .build();
    }
}