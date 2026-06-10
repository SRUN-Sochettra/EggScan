package com.eggscan.controller;

import com.eggscan.dto.ScanResponse;
import com.eggscan.service.ScanService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@Slf4j
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
            log.error("Error occurred while scanning username: {}", username, e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "An error occurred while processing the request"));
        }
    }

    @GetMapping("/battle")
    public ResponseEntity<?> battle(@RequestParam String u1, @RequestParam String u2) {
        try {
            return ResponseEntity.ok(scanService.battle(u1, u2));
        } catch (Exception e) {
            log.error("Error occurred during battle between {} and {}", u1, u2, e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "An error occurred while processing the request"));
        }
    }

    @GetMapping("/scan/result/{id}")
    public ResponseEntity<?> getScanById(@PathVariable String id) {
        try {
            ScanResponse response = scanService.getScanById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error occurred while fetching scan by id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "An error occurred while processing the request"));
        }
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard() {
        try {
            return ResponseEntity.ok(scanService.getLeaderboard());
        } catch (Exception e) {
            log.error("Error occurred while fetching leaderboard", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "An error occurred while processing the request"));
        }
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "service", "eggscan");
    }
}