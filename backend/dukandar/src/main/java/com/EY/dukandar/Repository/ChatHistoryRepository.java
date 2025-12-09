package com.EY.dukandar.Repository;

import com.EY.dukandar.Model.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    List<ChatHistory> findBySessionIdOrderByTimestampAsc(String sessionId);
}
