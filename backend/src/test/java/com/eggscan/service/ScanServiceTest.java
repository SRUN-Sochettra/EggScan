package com.eggscan.service;

import com.eggscan.dto.ScanResponse;
import com.eggscan.model.ScanRecord;
import com.eggscan.repository.ScanRecordRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ScanServiceTest {

    @Mock
    private GitHubService gitHubService;

    @Mock
    private GitHubGraphQLService graphQLService;

    @Mock
    private ReadmeService readmeService;

    @Mock
    private AIAnalyzerService analyzer;

    @Mock
    private ScanRecordRepository scanRecordRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private ScanService scanService;

    private ScanRecord mockRecord;
    private final String scanId = "test-id";

    @BeforeEach
    void setUp() {
        mockRecord = ScanRecord.builder()
                .id(scanId)
                .username("testuser")
                .score(100)
                .verdict("Golden Egg")
                .jsonPayload("{\"username\":\"testuser\"}")
                .scannedAt(LocalDateTime.now())
                .build();
    }


    @Test
    void getScanById_ReturnsScanResponse_WhenValidJson() throws Exception {
        // Arrange
        ScanResponse mockResponse = ScanResponse.builder()
                .username("testuser")
                .eggScore(100)
                .eggVerdict("Golden Egg")
                .build();

        when(scanRecordRepository.findById(scanId)).thenReturn(Optional.of(mockRecord));
        when(objectMapper.readValue(mockRecord.getJsonPayload(), ScanResponse.class)).thenReturn(mockResponse);

        // Act
        ScanResponse result = scanService.getScanById(scanId);

        // Assert
        assertNotNull(result);
        assertEquals(scanId, result.getId());
        assertEquals("testuser", result.getUsername());
        assertEquals(100, result.getEggScore());
    }


    @Test
    void getScanById_ThrowsRuntimeException_WhenInvalidJson() throws Exception {
        // Arrange
        when(scanRecordRepository.findById(scanId)).thenReturn(Optional.of(mockRecord));
        when(objectMapper.readValue(mockRecord.getJsonPayload(), ScanResponse.class))
                .thenThrow(new JsonProcessingException("Invalid JSON") {});

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            scanService.getScanById(scanId);
        });

        assertEquals("Failed to parse cached scan result", exception.getMessage());
    }


    @Test
    void getLeaderboard_ReturnsTop10Entries_GroupedByUser() {
        when(scanRecordRepository.findLeaderboard(any(org.springframework.data.domain.Pageable.class))).thenReturn(java.util.List.of(
                ScanRecord.builder()
                        .id("uuid1")
                        .username("user1")
                        .score(90)
                        .verdict("Golden Egg")
                        .avatarUrl("url1")
                        .vibe("vibe1")
                        .build(),
                ScanRecord.builder()
                        .id("uuid2")
                        .username("user2")
                        .score(85)
                        .verdict("Fresh Egg")
                        .avatarUrl("url2")
                        .vibe("vibe2")
                        .build()
        ));

        java.util.List<com.eggscan.dto.LeaderboardEntry> result = scanService.getLeaderboard();

        assertEquals(2, result.size());
        assertEquals("user1", result.get(0).getUsername());
        assertEquals(90, result.get(0).getEggScore());
        assertEquals("user2", result.get(1).getUsername());
        assertEquals(85, result.get(1).getEggScore());
    }
}
