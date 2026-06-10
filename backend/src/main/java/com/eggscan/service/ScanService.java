package com.eggscan.service;

import com.eggscan.dto.AIInsights;
import com.eggscan.dto.ScanResponse;
import com.eggscan.model.ContributionStats;
import com.eggscan.model.ScanResult;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class ScanService {

    private final GitHubService gitHubService;
    private final GitHubGraphQLService graphQLService;
    private final ReadmeService readmeService;
    private final AIAnalyzerService analyzer;

    public ScanService(GitHubService gitHubService,
                       GitHubGraphQLService graphQLService,
                       ReadmeService readmeService,
                       AIAnalyzerService analyzer) {
        this.gitHubService = gitHubService;
        this.graphQLService = graphQLService;
        this.readmeService = readmeService;
        this.analyzer = analyzer;
    }

    public ScanResponse scan(String username, String mode) {
        // 1. Fetch core data
        ScanResult data = gitHubService.scanUser(username);

        // 2. Fetch GraphQL extras (pinned + contributions)
        ContributionStats stats = graphQLService.fetchStats(username);

        // 3. Fetch top READMEs
        Map<String, String> readmes = readmeService.fetchTopReadmes(username, data.getRepos(), 5);
        data.setReposWithReadme(readmeService.countReposWithReadme(readmes));

        // 4. Send everything to Groq
        AIInsights ai = analyzer.analyze(data, stats, readmes, mode);

        return ScanResponse.builder()
                .username(data.getProfile().getLogin())
                .avatarUrl(data.getProfile().getAvatar_url())
                .name(data.getProfile().getName())
                .bio(data.getProfile().getBio())
                .eggVerdict(ai.getEggVerdict())
                .eggEmoji(emojiFor(ai.getEggVerdict()))
                .eggScore(ai.getEggScore())
                .firstImpression(ai.getFirstImpression())
                .skills(ai.getSkills())
                .improvements(ai.getImprovements())
                .vibe(ai.getVibe())
                .rawData(data)
                .stats(stats)
                .build();
    }

    private String emojiFor(String verdict) {
        return switch (verdict) {
            case "Golden Egg" -> "🥚✨";
            case "Hard Boiled" -> "🍳";
            case "Fresh Egg" -> "🐣";
            case "Cracked" -> "🥚💔";
            case "Scrambled" -> "🍳💀";
            default -> "🥚";
        };
    }
}