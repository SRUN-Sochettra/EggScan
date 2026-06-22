package com.eggscan.dto;

import com.eggscan.model.ScanResult;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
@lombok.extern.jackson.Jacksonized
public class ScanResponse {
    private String id;
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
    private String predictedJobTitle;
    private String predictedSalary;
    private com.eggscan.model.ContributionStats stats;
}