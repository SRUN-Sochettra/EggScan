package com.eggscan.model;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
@lombok.extern.jackson.Jacksonized
public class ContributionStats {
    private int totalContributionsLastYear;
    private int totalIssues;
    private int totalPullRequests;
    private List<PinnedRepo> pinnedRepos;
    private boolean hasPinnedRepos;
}