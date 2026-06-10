package com.eggscan.controller;

import com.eggscan.dto.ScanResponse;
import com.eggscan.service.ScanService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ScanController.class)
public class ScanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ScanService scanService;

    @Test
    public void scan_Returns200_WithDefaultMode() throws Exception {
        // Arrange
        String username = "testuser";
        ScanResponse mockResponse = ScanResponse.builder()
                .username(username)
                .build();

        when(scanService.scan(eq(username), eq("honest"))).thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(get("/api/scan/{username}", username)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username));
    }

    @Test
    public void scan_Returns200_WithCustomMode() throws Exception {
        // Arrange
        String username = "testuser";
        String mode = "roast";
        ScanResponse mockResponse = ScanResponse.builder()
                .username(username)
                .build();

        when(scanService.scan(eq(username), eq(mode))).thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(get("/api/scan/{username}", username)
                .param("mode", mode)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username));
    }

    @Test
    public void scan_Returns400_WhenExceptionThrown() throws Exception {
        // Arrange
        String username = "erroruser";
        String errorMessage = "User not found";

        when(scanService.scan(eq(username), anyString())).thenThrow(new RuntimeException(errorMessage));

        // Act & Assert
        mockMvc.perform(get("/api/scan/{username}", username)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(errorMessage));
    }
}