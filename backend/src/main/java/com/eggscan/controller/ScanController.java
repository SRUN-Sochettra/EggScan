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
    public ResponseEntity<?> scan(@PathVariable String username, @RequestParam(required = false, defaultValue = "honest") String mode) {
        try {
            ScanResponse response = scanService.scan(username, mode);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/battle")
    public ResponseEntity<?> battle(@RequestParam String u1, @RequestParam String u2) {
        try {
            return ResponseEntity.ok(scanService.battle(u1, u2));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/scan/result/{id}")
    public ResponseEntity<?> getScanById(@PathVariable String id) {
        try {
            ScanResponse response = scanService.getScanById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard() {
        try {
            return ResponseEntity.ok(scanService.getLeaderboard());
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