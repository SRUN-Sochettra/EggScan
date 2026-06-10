package com.eggscan.model;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
@lombok.extern.jackson.Jacksonized
public class ScanResult {
    private GitHubProfile profile;
    private List<GitHubRepo> repos;
    private Map<String, Integer> languageBreakdown;
    private int totalStars;
    private int activeRepos;
    private int reposWithReadme;
    private String lastActivity;
}