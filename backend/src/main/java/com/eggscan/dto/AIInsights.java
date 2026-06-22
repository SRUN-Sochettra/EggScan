package com.eggscan.dto;

import lombok.Data;
import java.util.List;

@Data
public class AIInsights {
    private String firstImpression;
    private List<String> skills;
    private List<String> improvements;
    private String vibe;
    private int eggScore;
    private String eggVerdict;
    private String predictedJobTitle;
    private String predictedSalary;
    private String githubWrapped;
}