package com.eggscan.benchmark;

import com.eggscan.model.ScanRecord;
import com.eggscan.repository.ScanRecordRepository;
import com.eggscan.service.ScanService;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.context.annotation.ComponentScan;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
@EntityScan(basePackages = "com.eggscan.model")
@EnableJpaRepositories(basePackages = "com.eggscan.repository")
@ComponentScan(basePackages = "com.eggscan")
public class LeaderboardBenchmark {

    public static void main(String[] args) {
        ApplicationContext context = SpringApplication.run(LeaderboardBenchmark.class, args);
        ScanRecordRepository repository = context.getBean(ScanRecordRepository.class);
        ScanService service = context.getBean(ScanService.class);

        System.out.println("Starting Benchmark Setup...");

        // Insert dummy data
        List<ScanRecord> records = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            String jsonPayload = String.format("{\"id\":\"%s\",\"username\":\"user%d\",\"avatarUrl\":\"url%d\",\"name\":\"Name%d\",\"bio\":\"Bio%d\",\"eggVerdict\":\"Golden Egg\",\"eggEmoji\":\"🥚\",\"eggScore\":%d,\"firstImpression\":\"Good\",\"skills\":[\"Java\"],\"improvements\":[\"None\"],\"vibe\":\"Chill\",\"rawData\":null,\"stats\":null}", UUID.randomUUID().toString(), i, i, i, i, (i % 100));
            records.add(ScanRecord.builder()
                .id(UUID.randomUUID().toString())
                .username("user" + i)
                .avatarUrl("url" + i)
                .vibe("Chill")
                .score(i % 100)
                .verdict("Golden Egg")
                .jsonPayload(jsonPayload)
                .scannedAt(LocalDateTime.now().minusDays(i % 10))
                .build());
        }
        repository.saveAll(records);
        System.out.println("Inserted 1000 records.");

        // Warmup
        for (int i = 0; i < 50; i++) {
            service.getLeaderboard();
        }

        // Benchmark
        long totalTime = 0;
        int iterations = 100;
        for (int i = 0; i < iterations; i++) {
            long start = System.nanoTime();
            service.getLeaderboard();
            long end = System.nanoTime();
            totalTime += (end - start);
        }

        double avgMs = (totalTime / (double) iterations) / 1_000_000.0;
        System.out.println("=================================================");
        System.out.println("Average time for getLeaderboard(): " + avgMs + " ms");
        System.out.println("=================================================");

        System.exit(0);
    }
}
