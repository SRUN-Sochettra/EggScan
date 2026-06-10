package com.eggscan.service;

import com.eggscan.dto.AIInsights;
import com.eggscan.dto.ScanResponse;
import com.eggscan.model.ContributionStats;
import com.eggscan.model.ScanResult;
import com.eggscan.model.ScanRecord;
import com.eggscan.repository.ScanRecordRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;
import com.eggscan.dto.BattleResponse;

@Service
public class ScanService {

    private final GitHubService gitHubService;
    private final GitHubGraphQLService graphQLService;
    private final ReadmeService readmeService;
    private final AIAnalyzerService analyzer;
    private final ScanRecordRepository scanRecordRepository;
    private final ObjectMapper objectMapper;

    public ScanService(GitHubService gitHubService,
                       GitHubGraphQLService graphQLService,
                       ReadmeService readmeService,
                       AIAnalyzerService analyzer,
                       ScanRecordRepository scanRecordRepository,
                       ObjectMapper objectMapper) {
        this.gitHubService = gitHubService;
        this.graphQLService = graphQLService;
        this.readmeService = readmeService;
        this.analyzer = analyzer;
        this.scanRecordRepository = scanRecordRepository;
        this.objectMapper = objectMapper;
    }

    public ScanResponse getScanById(String id) {
        ScanRecord record = scanRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scan not found"));
        try {
            ScanResponse response = objectMapper.readValue(record.getJsonPayload(), ScanResponse.class);
            response.setId(record.getId()); // Ensure ID is present
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse cached scan result", e);
        }
    }

    public List<ScanResponse> getLeaderboard() {
        return scanRecordRepository.findTop10ByOrderByScoreDesc().stream().map(record -> {
            try {
                ScanResponse response = objectMapper.readValue(record.getJsonPayload(), ScanResponse.class);
                response.setId(record.getId());
                return response;
            } catch (Exception e) {
                return null;
            }
        }).filter(java.util.Objects::nonNull).collect(Collectors.toList());
    }

    public ScanResponse scan(String username, String mode) {
        // Serve from cache ONLY if mode matches the cached record (currently we only cache 'honest' mode)
        if ("honest".equalsIgnoreCase(mode) || mode == null) {
            Optional<ScanRecord> recentScan = scanRecordRepository.findFirstByUsernameOrderByScannedAtDesc(username);
            // Verify the cached scan was also 'honest' or if not stored, assume default behavior
            if (recentScan.isPresent() && recentScan.get().getScannedAt().isAfter(LocalDateTime.now().minusHours(24))) {
                try {
                    ScanResponse cachedResponse = objectMapper.readValue(recentScan.get().getJsonPayload(), ScanResponse.class);
                    cachedResponse.setId(recentScan.get().getId());
                    return cachedResponse;
                } catch (Exception e) {
                    // fall through and re-scan
                }
            }
        }

        // 1. Fetch core data
        ScanResult data = gitHubService.scanUser(username);

        // 2. Fetch GraphQL extras (pinned + contributions)
        ContributionStats stats = graphQLService.fetchStats(username);

        // 3. Fetch top READMEs
        Map<String, String> readmes = readmeService.fetchTopReadmes(username, data.getRepos(), 5);
        data.setReposWithReadme(readmeService.countReposWithReadme(readmes));

        // 4. Send everything to Groq
        AIInsights ai = analyzer.analyze(data, stats, readmes, mode);

        ScanResponse response = ScanResponse.builder()
                .id(UUID.randomUUID().toString())
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

        // We only cache the 'honest' mode to populate the leaderboard and avoid serving roasts on permalinks by default.
        if ("honest".equalsIgnoreCase(mode) || mode == null) {
            try {
                ScanRecord record = ScanRecord.builder()
                        .id(response.getId())
                        .username(response.getUsername())
                        .score(response.getEggScore())
                        .verdict(response.getEggVerdict())
                        .jsonPayload(objectMapper.writeValueAsString(response))
                        .scannedAt(LocalDateTime.now())
                        .build();
                scanRecordRepository.save(record);
            } catch (Exception e) {
                System.err.println("Failed to cache scan result: " + e.getMessage());
            }
        }

        return response;
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

    public BattleResponse battle(String username1, String username2) {
        ScanResponse s1 = scan(username1, "honest");
        ScanResponse s2 = scan(username2, "honest");

        String[] battleResult = analyzer.battle(s1.getRawData(), s1.getStats(), s2.getRawData(), s2.getStats()).split("\\|\\|\\|");
        String winner = battleResult[0];
        String report = battleResult.length > 1 ? battleResult[1] : "A legendary battle without a report.";

        return BattleResponse.builder()
                .user1(s1)
                .user2(s2)
                .winnerUsername(winner)
                .battleReport(report)
                .build();
    }
}