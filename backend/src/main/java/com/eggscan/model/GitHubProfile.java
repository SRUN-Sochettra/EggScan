package com.eggscan.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class GitHubProfile {
    private String login;
    private String name;
    private String bio;
    private String avatar_url;
    private String html_url;
    private String company;
    private String location;
    private Integer public_repos;
    private Integer followers;
    private Integer following;
    private String created_at;
}