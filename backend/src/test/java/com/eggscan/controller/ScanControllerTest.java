package com.eggscan.controller;

import com.eggscan.dto.ScanResponse;
import com.eggscan.service.ScanService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ScanController.class)
public class ScanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ScanService scanService;

    @Test
    void scan_Returns200AndScanResponse_WhenDefaultMode() throws Exception {
        // Arrange
        String username = "testuser";
        ScanResponse mockResponse = ScanResponse.builder()
                .username(username)
                .eggVerdict("Golden Egg")
                .eggScore(95)
                .build();

        when(scanService.scan(username, "honest")).thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(get("/api/scan/{username}", username))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username))
                .andExpect(jsonPath("$.eggVerdict").value("Golden Egg"))
                .andExpect(jsonPath("$.eggScore").value(95));
    }

    @Test
    void scan_Returns200AndScanResponse_WhenCustomMode() throws Exception {
        // Arrange
        String username = "testuser";
        String mode = "roast";
        ScanResponse mockResponse = ScanResponse.builder()
                .username(username)
                .eggVerdict("Scrambled Egg")
                .eggScore(45)
                .build();

        when(scanService.scan(username, mode)).thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(get("/api/scan/{username}", username)
                        .param("mode", mode))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username))
                .andExpect(jsonPath("$.eggVerdict").value("Scrambled Egg"))
                .andExpect(jsonPath("$.eggScore").value(45));
    }

    @Test
    void scan_Returns400AndErrorMessage_WhenExceptionThrown() throws Exception {
        // Arrange
        String username = "testuser";
        String errorMessage = "User not found";

        when(scanService.scan(username, "honest")).thenThrow(new RuntimeException(errorMessage));

        // Act & Assert
        mockMvc.perform(get("/api/scan/{username}", username))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(errorMessage));
    }
}
