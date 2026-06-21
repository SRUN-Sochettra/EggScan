package com.eggscan.service;

import com.eggscan.dto.ScanResponse;
import com.eggscan.model.ScanResult;
import com.eggscan.model.ScanRecord;
import com.eggscan.repository.ScanRecordRepository;
import com.eggscan.model.ContributionStats;
import com.eggscan.dto.AIInsights;
import com.eggscan.dto.BattleResponse;
import com.eggscan.dto.RepoDeepDiveResponse;
import com.eggscan.dto.CommitShameResponse;
import com.eggscan.dto.ReadmeRaterResponse;
import com.eggscan.dto.StackRoastResponse;
import com.eggscan.model.GitHubTreeResponse;
import com.eggscan.model.GitHubTreeItem;
import com.eggscan.model.GitHubCommitResponse;
import com.eggscan.model.GitHubEventResponse;
import java.util.HashMap;
import java.util.ArrayList;

import org.springframework.data.domain.PageRequest;
import java.util.stream.Collectors;
import java.util.UUID;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import org.springframework.beans.factory.annotation.Qualifier;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
@Slf4j
public class ScanService {

    private final GitHubService gitHubService;
    private final GitHubGraphQLService graphQLService;
    private final ReadmeService readmeService;
    private final AIAnalyzerService analyzer;
    private final ScanRecordRepository scanRecordRepository;
    private final ObjectMapper objectMapper;
    private final Executor scanExecutor;

    public ScanService(GitHubService gitHubService,
                       GitHubGraphQLService graphQLService,
                       ReadmeService readmeService,
                       AIAnalyzerService analyzer,
                       ScanRecordRepository scanRecordRepository,
                       ObjectMapper objectMapper,
                       @Qualifier("scanExecutor") Executor scanExecutor) {
        this.gitHubService = gitHubService;
        this.graphQLService = graphQLService;
        this.readmeService = readmeService;
        this.analyzer = analyzer;
        this.scanRecordRepository = scanRecordRepository;
        this.objectMapper = objectMapper;
        this.scanExecutor = scanExecutor;
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

    public List<com.eggscan.dto.LeaderboardEntry> getLeaderboard() {
        return scanRecordRepository.findLeaderboard(PageRequest.of(0, 10)).stream().map(record -> {
            return com.eggscan.dto.LeaderboardEntry.builder()
                    .id(record.getId())
                    .username(record.getUsername())
                    .avatarUrl(record.getAvatarUrl())
                    .vibe(record.getVibe())
                    .eggScore(record.getScore())
                    .eggVerdict(record.getVerdict())
                    .build();
        }).collect(Collectors.toList());
    }

    public ScanResponse scan(String username, String mode) {
        log.info("Scanning username: {}", username);

        Optional<ScanResponse> cachedResponse = getCachedScanIfEligible(username, mode);
        if (cachedResponse.isPresent()) {
            return cachedResponse.get();
        }

        ScanResponse response = performNewScan(username, mode);
        cacheResultIfEligible(response, mode);

        return response;
    }

    private Optional<ScanResponse> getCachedScanIfEligible(String username, String mode) {
        // Serve from cache ONLY if mode matches the cached record (currently we only cache 'honest' mode)
        if (!isHonestMode(mode)) {
            return Optional.empty();
        }

        Optional<ScanRecord> recentScan = scanRecordRepository.findFirstByUsernameOrderByScannedAtDesc(username);
        if (recentScan.isPresent() && recentScan.get().getScannedAt().isAfter(LocalDateTime.now().minusHours(24))) {
            try {
                ScanResponse cachedResponse = objectMapper.readValue(recentScan.get().getJsonPayload(), ScanResponse.class);
                cachedResponse.setId(recentScan.get().getId());
                log.info("Returning cached scan result for username: {}", username);
                return Optional.of(cachedResponse);
            } catch (Exception e) {
                log.warn("Failed to parse cached scan result for username: {}, falling back to re-scan", username, e);
            }
        }
        return Optional.empty();
    }

    private ScanResponse performNewScan(String username, String mode) {
        CompletableFuture<ScanResult> futureData = CompletableFuture.supplyAsync(() -> gitHubService.scanUser(username), scanExecutor);
        CompletableFuture<ContributionStats> futureStats = CompletableFuture.supplyAsync(() -> graphQLService.fetchStats(username), scanExecutor);

        CompletableFuture.allOf(futureData, futureStats).join();

        ScanResult data = futureData.join();
        ContributionStats stats = futureStats.join();
        Map<String, String> readmes = readmeService.fetchTopReadmes(username, data.getRepos(), 5);
        data.setReposWithReadme(readmeService.countReposWithReadme(readmes));

        AIInsights ai = analyzer.analyze(data, stats, readmes, mode);

        return buildResponse(data, stats, ai);
    }

    private ScanResponse buildResponse(ScanResult data, ContributionStats stats, AIInsights ai) {
        return ScanResponse.builder()
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
    }

    private void cacheResultIfEligible(ScanResponse response, String mode) {
        // We only cache the 'honest' mode to populate the leaderboard and avoid serving roasts on permalinks by default.
        if (isHonestMode(mode)) {
            try {
                ScanRecord record = ScanRecord.builder()
                        .id(response.getId())
                        .username(response.getUsername())
                        .score(response.getEggScore())
                        .verdict(response.getEggVerdict())
                        .avatarUrl(response.getAvatarUrl())
                        .vibe(response.getVibe())
                        .jsonPayload(objectMapper.writeValueAsString(response))
                        .scannedAt(LocalDateTime.now())
                        .build();
                scanRecordRepository.save(record);
                log.info("Cached scan result for username: {}", response.getUsername());
            } catch (Exception e) {
                log.error("Failed to cache scan result for username: {}", response.getUsername(), e);
            }
        }
    }

    private boolean isHonestMode(String mode) {
        return "honest".equalsIgnoreCase(mode) || mode == null;
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
        CompletableFuture<ScanResponse> futureS1 = CompletableFuture.supplyAsync(() -> scan(username1, "honest"), scanExecutor);
        CompletableFuture<ScanResponse> futureS2 = CompletableFuture.supplyAsync(() -> scan(username2, "honest"), scanExecutor);

        CompletableFuture.allOf(futureS1, futureS2).join();

        ScanResponse s1 = futureS1.join();
        ScanResponse s2 = futureS2.join();

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

    public RepoDeepDiveResponse repoDeepDive(String username, String repoName, String defaultBranch) {
        log.info("Deep diving into repository: {}/{}", username, repoName);

        GitHubTreeResponse tree = gitHubService.fetchRepoTree(username, repoName, defaultBranch);
        List<GitHubCommitResponse> commits = gitHubService.fetchRecentCommits(username, repoName);

        String readme = gitHubService.fetchFileContent(username, repoName, "README.md");
        if (readme == null) {
            readme = gitHubService.fetchFileContent(username, repoName, "readme.md");
        }

        Map<String, String> configFiles = new HashMap<>();
        List<String> filesToLookFor = List.of("package.json", "pom.xml", "docker-compose.yml", "requirements.txt", "build.gradle", "go.mod");

        if (tree != null && tree.getTree() != null) {
            List<String> matchingFiles = tree.getTree().stream()
                    .map(GitHubTreeItem::getPath)
                    .filter(filesToLookFor::contains)
                    .toList();

            List<Map.Entry<String, String>> results = Flux.fromIterable(matchingFiles)
                    .flatMapSequential(path -> gitHubService.fetchFileContentMono(username, repoName, path)
                            .map(content -> Map.entry(path, content)))
                    .collectList()
                    .block();

            if (results != null) {
                for (Map.Entry<String, String> entry : results) {
                    if (!entry.getValue().isEmpty()) {
                        configFiles.put(entry.getKey(), entry.getValue());
                    }
                }
            }
        }

        return analyzer.analyzeRepository(username, repoName, readme, tree, configFiles, commits);
    }

    public CommitShameResponse shameCommits(String username, String repo, String tone) {
        log.info("Shaming commits for username: {}, repo: {}, tone: {}", username, repo, tone);
        List<String> commitMessages = new ArrayList<>();

        if (repo != null && !repo.isBlank()) {
            List<GitHubCommitResponse> commits = gitHubService.fetchRecentCommits(username, repo);
            commits.forEach(c -> commitMessages.add(c.getCommit().getMessage()));
        } else {
            List<GitHubEventResponse> events = gitHubService.fetchUserEvents(username);
            for (GitHubEventResponse event : events) {
                if ("PushEvent".equals(event.getType()) && event.getPayload() != null && event.getPayload().getCommits() != null) {
                    for (GitHubEventResponse.Commit commit : event.getPayload().getCommits()) {
                        commitMessages.add(commit.getMessage());
                        if (commitMessages.size() >= 30) break;
                    }
                }
                if (commitMessages.size() >= 30) break;
            }
        }

        if (commitMessages.isEmpty()) {
            commitMessages.add("No recent commits found.");
        }

        return analyzer.shameCommits(commitMessages, tone);
    }

    public ReadmeRaterResponse rateReadmes(String username, String tone) {
        log.info("Rating readmes for username: {}, tone: {}", username, tone);
        ScanResult data = gitHubService.scanUser(username);

        Map<String, String> readmes = readmeService.fetchTopReadmes(username, data.getRepos(), 3);

        String profileReadme = gitHubService.fetchFileContent(username, username, "README.md");
        if (profileReadme == null) {
            profileReadme = gitHubService.fetchFileContent(username, username, "readme.md");
        }
        if (profileReadme != null) {
            readmes.put(username + "/" + username + " (Profile)", profileReadme);
        }

        return analyzer.rateReadmes(readmes, tone);
    }

    public StackRoastResponse roastStack(String username, String tone) {
        log.info("Roasting stack for username: {}, tone: {}", username, tone);
        ScanResult data = gitHubService.scanUser(username);

        Map<String, String> configFiles = new HashMap<>();
        List<String> filesToLookFor = List.of("package.json", "pom.xml", "docker-compose.yml", "requirements.txt", "build.gradle", "go.mod");

        // Fetch configs for top 2 repos to keep it fast
        data.getRepos().stream().limit(2).forEach(r -> {
            String repoName = r.getName();
            GitHubTreeResponse tree = gitHubService.fetchRepoTree(username, repoName, r.getDefault_branch() != null ? r.getDefault_branch() : "main");
            if (tree != null && tree.getTree() != null) {
                List<String> matchingFiles = tree.getTree().stream()
                        .map(GitHubTreeItem::getPath)
                        .filter(filesToLookFor::contains)
                        .toList();

                List<Map.Entry<String, String>> results = Flux.fromIterable(matchingFiles)
                        .flatMapSequential(path -> gitHubService.fetchFileContentMono(username, repoName, path)
                                .map(content -> Map.entry(repoName + "/" + path, content)))
                        .collectList()
                        .block();

                if (results != null) {
                    for (Map.Entry<String, String> entry : results) {
                        if (!entry.getValue().isEmpty()) {
                            configFiles.put(entry.getKey(), entry.getValue());
                        }
                    }
                }
            }
        });

        return analyzer.roastStack(data.getLanguageBreakdown(), configFiles, tone);
    }
}
