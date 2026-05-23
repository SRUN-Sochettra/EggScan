package com.eggscan.controller;

import com.eggscan.dto.ScanResponse;
import com.eggscan.service.ScanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ScanController {

    private final ScanService scanService;

    public ScanController(ScanService scanService) {
        this.scanService = scanService;
    }

    @GetMapping("/scan/{username}")
    public ResponseEntity<?> scan(@PathVariable String username) {
        try {
            ScanResponse response = scanService.scan(username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "service", "eggscan");
    }
}