package com.eggscan.service;

import com.eggscan.dto.AIInsights;
import com.eggscan.model.ContributionStats;
import com.eggscan.model.PinnedRepo;
import com.eggscan.model.ScanResult;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AIAnalyzerService {

    private final GroqService groq;

    public AIAnalyzerService(GroqService groq) {
        this.groq = groq;
    }

    private String getSystemPrompt(String mode) {
        String persona;
        if (mode == null) mode = "honest";
        switch (mode.toLowerCase()) {
            case "roast":
                persona = "You are a ruthless, cynical senior engineer who hates everyone's code. You speak directly and roast the user aggressively. You find every little flaw and mock it mercilessly. You don't hold back.";
                break;
            case "hype":
                persona = "You are a hyper-enthusiastic startup founder who thinks everything is revolutionary! You use lots of exclamation points and hype up even the most basic skills. You speak with relentless optimism and energy.";
                break;
            case "pirate":
                persona = "You are a salty pirate captain sailing the high seas of open source. You speak entirely in pirate slang, talking about bounties, doubloons, mutiny, and ships (repos).";
                break;
            case "professional":
                persona = "You are an extremely polite, formal, and encouraging HR professional. You give gentle, corporate-friendly feedback and always find a polite way to suggest improvements.";
                break;
            case "honest":
            default:
                persona = "You are a brutally honest senior tech recruiter who reviews GitHub profiles for a living. You speak directly, no fluff, no corporate language. You call out red flags but stay constructive.";
                break;
        }

        return persona + """

            You ALWAYS respond with valid JSON matching this exact shape:
            {
              "firstImpression": "2-3 sentences about what a recruiter sees in the first 15 seconds",
              "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
              "improvements": ["specific actionable fix 1", "fix 2", "fix 3", "fix 4"],
              "vibe": "one short phrase describing their developer personality",
              "eggScore": 0-100 integer,
              "eggVerdict": "exactly one of: Golden Egg, Hard Boiled, Fresh Egg, Cracked, Scrambled"
            }
            
            IMPORTANT RULES:
            - DO NOT use emojis anywhere in your response. No emojis in vibe, skills, improvements, or any field.
            - Use plain text only. The frontend handles all visual styling.
            - Vibe examples (good): "Quiet builder", "Weekend tinkerer", "Architecture-first thinker", "Ships fast, documents later"
            - Vibe examples (bad): "Quiet builder 🛠️", "Weekend tinkerer 🌙"
            
            Verdict thresholds:
            - 80-100: Golden Egg (recruiter ready)
            - 65-79:  Hard Boiled (solid profile)
            - 45-64:  Fresh Egg (just getting started)
            - 25-44:  Cracked (needs work)
            - 0-24:   Scrambled (do not apply yet)
            
            Skills must be REAL technologies/languages/frameworks visible in their repos — never invent skills.
            Improvements must be specific and actionable, not generic advice.
            """;
    }

    public AIInsights analyze(ScanResult scan, ContributionStats stats, Map<String, String> readmes, String mode) {
        String context = buildContext(scan, stats, readmes);
        JsonNode json = groq.chatJson(getSystemPrompt(mode), context);

        AIInsights out = new AIInsights();
        out.setFirstImpression(stripEmoji(json.path("firstImpression").asText("")));
        out.setVibe(stripEmoji(json.path("vibe").asText("")));
        out.setEggScore(clamp(json.path("eggScore").asInt(0)));
        out.setEggVerdict(json.path("eggVerdict").asText("Fresh Egg"));

        List<String> skills = new ArrayList<>();
        json.path("skills").forEach(n -> skills.add(stripEmoji(n.asText())));
        out.setSkills(skills);

        List<String> improvements = new ArrayList<>();
        json.path("improvements").forEach(n -> improvements.add(stripEmoji(n.asText())));
        out.setImprovements(improvements);

        return out;
    }

    public String battle(ScanResult scan1, ContributionStats stats1, ScanResult scan2, ContributionStats stats2) {
        String prompt = "You are an aggressive fighting game announcer. Two developers are battling. Read their stats and declare a winner in exactly one paragraph. Roast the loser. Hype the winner. Be highly entertaining.";

        StringBuilder context = new StringBuilder();
        context.append("--- PLAYER 1: ").append(scan1.getProfile().getLogin()).append(" ---\n");
        context.append("Total Stars: ").append(scan1.getTotalStars()).append("\n");
        context.append("Contributions: ").append(stats1.getTotalContributionsLastYear()).append("\n");
        context.append("Public Repos: ").append(scan1.getProfile().getPublic_repos()).append("\n\n");

        context.append("--- PLAYER 2: ").append(scan2.getProfile().getLogin()).append(" ---\n");
        context.append("Total Stars: ").append(scan2.getTotalStars()).append("\n");
        context.append("Contributions: ").append(stats2.getTotalContributionsLastYear()).append("\n");
        context.append("Public Repos: ").append(scan2.getProfile().getPublic_repos()).append("\n\n");

        context.append("Respond with JSON: { \"winner\": \"username\", \"report\": \"your paragraph here\" }");

        try {
            com.fasterxml.jackson.databind.JsonNode json = groq.chatJson(prompt, context.toString());
            return json.path("winner").asText() + "|||" + stripEmoji(json.path("report").asText());
        } catch (Exception e) {
            return scan1.getProfile().getLogin() + "|||It's a tie because the AI crashed.";
        }
    }

    private int clamp(int v) {
        return Math.max(0, Math.min(100, v));
    }

    private String stripEmoji(String input) {
        if (input == null) return "";
        String cleaned = input.replaceAll(
                "[\\p{So}\\p{Cn}]|" +
                        "[\\x{1F000}-\\x{1FFFF}]|" +
                        "[\\x{2600}-\\x{27BF}]|" +
                        "[\\x{FE00}-\\x{FE0F}]|" +
                        "[\\x{200D}]",
                ""
        );
        return cleaned.replaceAll("\\s+", " ").trim();
    }

    private String buildContext(ScanResult scan, ContributionStats stats, Map<String, String> readmes) {
        StringBuilder sb = new StringBuilder();

        appendProfileSection(sb, scan.getProfile());
        appendActivitySection(sb, stats, scan);
        appendLanguagesSection(sb, scan);
        appendPinnedReposSection(sb, stats);
        appendTopReposSection(sb, scan);
        appendReadmeSnippetsSection(sb, readmes);

        sb.append("Now produce the JSON analysis. Be honest. Be specific. No filler.");
        return sb.toString();
    }

    private void appendProfileSection(StringBuilder sb, com.eggscan.model.GitHubProfile p) {
        sb.append("=== PROFILE ===\n");
        sb.append("Login: ").append(p.getLogin()).append("\n");
        sb.append("Name: ").append(nullSafe(p.getName())).append("\n");
        sb.append("Bio: ").append(nullSafe(p.getBio())).append("\n");
        sb.append("Company: ").append(nullSafe(p.getCompany())).append("\n");
        sb.append("Location: ").append(nullSafe(p.getLocation())).append("\n");
        sb.append("Public repos: ").append(p.getPublic_repos()).append("\n");
        sb.append("Followers: ").append(p.getFollowers()).append("\n");
        sb.append("Joined: ").append(p.getCreated_at()).append("\n\n");
    }

    private void appendActivitySection(StringBuilder sb, ContributionStats stats, ScanResult scan) {
        sb.append("=== ACTIVITY ===\n");
        sb.append("Contributions last year: ").append(stats.getTotalContributionsLastYear()).append("\n");
        sb.append("Issues opened: ").append(stats.getTotalIssues()).append("\n");
        sb.append("Pull requests: ").append(stats.getTotalPullRequests()).append("\n");
        sb.append("Active repos (pushed in 180d): ").append(scan.getActiveRepos()).append("\n");
        sb.append("Total stars across own repos: ").append(scan.getTotalStars()).append("\n");
        sb.append("Last push: ").append(scan.getLastActivity()).append("\n\n");
    }

    private void appendLanguagesSection(StringBuilder sb, ScanResult scan) {
        sb.append("=== LANGUAGES (own repos) ===\n");
        scan.getLanguageBreakdown().entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .forEach(e -> sb.append("- ").append(e.getKey()).append(": ").append(e.getValue()).append(" repo(s)\n"));
        sb.append("\n");
    }

    private void appendPinnedReposSection(StringBuilder sb, ContributionStats stats) {
        sb.append("=== PINNED REPOS ===\n");
        if (stats.getPinnedRepos().isEmpty()) {
            sb.append("(none — recruiter sees random repos instead)\n");
        } else {
            for (PinnedRepo pr : stats.getPinnedRepos()) {
                sb.append("- ").append(pr.getName())
                        .append(" [").append(nullSafe(pr.getPrimaryLanguage())).append("] ")
                        .append("stars:").append(pr.getStars())
                        .append(" — ").append(nullSafe(pr.getDescription())).append("\n");
            }
        }
        sb.append("\n");
    }

    private void appendTopReposSection(StringBuilder sb, ScanResult scan) {
        sb.append("=== TOP REPOS (sample) ===\n");
        scan.getRepos().stream().limit(10).forEach(r -> {
            sb.append("- ").append(r.getName())
                    .append(" [").append(nullSafe(r.getLanguage())).append("] ")
                    .append("stars:").append(Optional.ofNullable(r.getStargazers_count()).orElse(0))
                    .append(" — ").append(nullSafe(r.getDescription()))
                    .append(" (last push: ").append(nullSafe(r.getPushed_at())).append(")\n");
        });
        sb.append("\n");
    }

    private void appendReadmeSnippetsSection(StringBuilder sb, Map<String, String> readmes) {
        sb.append("=== README SNIPPETS ===\n");
        int reposWithReadme = 0;
        for (var entry : readmes.entrySet()) {
            String body = entry.getValue();
            if (body == null || body.isBlank()) {
                sb.append("[").append(entry.getKey()).append("] (NO README)\n\n");
            } else {
                reposWithReadme++;
                sb.append("[").append(entry.getKey()).append("]\n");
                sb.append(body.length() > 800 ? body.substring(0, 800) + "..." : body).append("\n\n");
            }
        }
        sb.append("README coverage: ").append(reposWithReadme).append(" of ").append(readmes.size()).append(" top repos\n\n");
    }

    private String nullSafe(Object o) {
        return o == null ? "(none)" : o.toString();
    }
}