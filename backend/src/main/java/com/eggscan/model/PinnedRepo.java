package com.eggscan.model;

import lombok.Data;

@Data
public class PinnedRepo {
    private String name;
    private String description;
    private String primaryLanguage;
    private int stars;
    private String url;
}