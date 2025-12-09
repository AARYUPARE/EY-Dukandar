package com.EY.dukandar.Repository;

import com.EY.dukandar.Model.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    ChatSession findBySessionId(String sessionId);
}
