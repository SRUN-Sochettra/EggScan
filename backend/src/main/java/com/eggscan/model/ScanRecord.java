package com.eggscan.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "scan_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScanRecord {
    @Id
    private String id;

    private String username;

    private int score;

    private String verdict;

    @Column(columnDefinition = "TEXT")
    private String jsonPayload;

    private LocalDateTime scannedAt;
}
