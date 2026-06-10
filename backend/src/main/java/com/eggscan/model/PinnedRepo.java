package com.eggscan.model;

import lombok.Data;

@Data
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class PinnedRepo {
    private String name;
    private String description;
    private String primaryLanguage;
    private int stars;
    private String url;
}