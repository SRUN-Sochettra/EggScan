package com.eggscan.dto;

import com.eggscan.model.ScanResult;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ScanResponse {
    private String username;
    private String avatarUrl;
    private String name;
    private String bio;
    private String eggVerdict;       // "Golden Egg", "Hard Boiled", etc.
    private String eggEmoji;
    private int eggScore;            // 0-100
    private String firstImpression;
    private List<String> skills;
    private List<String> improvements;
    private String vibe;
    private ScanResult rawData;
    private com.eggscan.model.ContributionStats stats;
}