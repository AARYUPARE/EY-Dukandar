package com.EY.dukandar.Service;

import com.EY.dukandar.LangChain.LangChainClient;
import com.EY.dukandar.Model.ChatHistory;
import com.EY.dukandar.Model.ChatRequest;
import com.EY.dukandar.Model.ChatSession;
import com.EY.dukandar.Repository.ChatHistoryRepository;
import com.EY.dukandar.Repository.ChatSessionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatServiceImplementation implements ChatService {

    @Autowired
    private ChatHistoryRepository chatHistoryRepository;

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Autowired
    private LangChainClient langChainClient;

    @Override
    public String processMessage(ChatRequest request) {
        // Load history
        List<ChatHistory> history = chatHistoryRepository.findBySessionIdOrderByTimestampAsc(request.getSessionId());

        // Build context
        String context = buildContext(history);

        // Call Python LangChain agent
        String botResponse = langChainClient.sendToAgent(context, request.getMessage());

        // Save chat history
        ChatHistory chatEntry = new ChatHistory();
        chatEntry.setUserId(request.getUserId());
        chatEntry.setSessionId(request.getSessionId());
        chatEntry.setUserMessage(request.getMessage());
        chatEntry.setBotResponse(botResponse);
        chatEntry.setTimestamp(LocalDateTime.now());
        chatHistoryRepository.save(chatEntry);

        // Update or create session
        ChatSession session = getOrCreateChatSession(request.getUserId(), request.getSessionId());
        session.setLastActiveAt(LocalDateTime.now());
        chatSessionRepository.save(session);

        return botResponse;
    }

    @Override
    public List<ChatHistory> getChatHistoryBySession(String sessionId) {
        return chatHistoryRepository.findBySessionIdOrderByTimestampAsc(sessionId);
    }

    @Override
    public ChatSession getOrCreateChatSession(Long userId, String sessionId) {
        ChatSession session = chatSessionRepository.findBySessionId(sessionId);
        if (session == null) {
            session = new ChatSession();
            session.setUserId(userId);
            session.setSessionId(sessionId);
            LocalDateTime now = LocalDateTime.now();
            session.setCreatedAt(now);
            session.setLastActiveAt(now);
            chatSessionRepository.save(session);
        }
        return session;
    }

    @Override
    public void updateSessionActivity(String sessionId) {
        ChatSession session = chatSessionRepository.findBySessionId(sessionId);
        if (session != null) {
            session.setLastActiveAt(LocalDateTime.now());
            chatSessionRepository.save(session);
        }
    }

    private String buildContext(List<ChatHistory> history) {
        StringBuilder sb = new StringBuilder();
        for (ChatHistory h : history) {
            sb.append("User: ").append(h.getUserMessage()).append("\n");
            sb.append("Bot: ").append(h.getBotResponse()).append("\n");
        }
        return sb.toString();
    }
}
