package com.eggscan.repository;

import com.eggscan.model.ScanRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScanRecordRepository extends JpaRepository<ScanRecord, String> {
    Optional<ScanRecord> findFirstByUsernameOrderByScannedAtDesc(String username);
    List<ScanRecord> findTop10ByOrderByScoreDesc();
}
