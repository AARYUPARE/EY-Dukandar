package com.EY.dukandar.Service;

import com.EY.dukandar.LangChain.LangChainClient;
import com.EY.dukandar.Model.*;
import com.EY.dukandar.Repository.ChatHistoryRepository;
import com.EY.dukandar.Repository.ChatSessionRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class ChatServiceImplementation implements ChatService {

    @Autowired
    private ChatHistoryRepository chatHistoryRepository;

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Autowired
    private LangChainClient langChainClient;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public ChatResponse processMessage(ChatRequest request) {

        if (request.getSessionId() == null || request.getSessionId().isEmpty()) {
            throw new IllegalArgumentException("SessionId cannot be null or empty");
        }

        if (request.getUserId() == null) {
            throw new IllegalArgumentException("UserId cannot be null");
        }

        // Load history
        List<ChatHistory> history =
                chatHistoryRepository.findBySessionIdOrderByTimestampAsc(
                        request.getSessionId()
                );

        String context = buildContext(history);

        // 🔥 Load last product list from session
        ChatSession session =
                getOrCreateChatSession(request.getUserId(), request.getSessionId());

        List<Product> lastProducts = Collections.emptyList();

        if (session.getLastProductSnapshot() != null) {
            try {
                lastProducts = objectMapper.readValue(
                        session.getLastProductSnapshot(),
                        new TypeReference<List<Product>>() {}
                );
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // 🔥 Send context + message + lastProducts to Python agent
        Map<String, Object> agentResult =
                langChainClient.sendToAgent(
                        context,
                        request.getMessage(),
                        lastProducts
                );

        String reply = (String) agentResult.getOrDefault(
                "reply", "Sorry, I couldn't understand that."
        );

        List<Product> products =
                (List<Product>) agentResult.getOrDefault(
                        "products", Collections.emptyList()
                );

        // Save chat history
        ChatHistory entry = new ChatHistory();
        entry.setUserId(request.getUserId());
        entry.setSessionId(request.getSessionId());
        entry.setUserMessage(request.getMessage());
        entry.setBotResponse(reply);
        entry.setTimestamp(LocalDateTime.now());
        chatHistoryRepository.save(entry);

        // 🔥 Update session
        session.setLastActiveAt(LocalDateTime.now());

        if (products != null && !products.isEmpty()) {
            try {
                String snapshot = objectMapper.writeValueAsString(products);
                session.setLastProductSnapshot(snapshot);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        chatSessionRepository.save(session);

        // Response
        ChatResponse response = new ChatResponse();
        response.setSessionId(request.getSessionId());
        response.setReply(reply);
        response.setProducts(products);

        return response;
    }

    @Override
    public List<ChatHistory> getChatHistoryBySession(String sessionId) {
        return chatHistoryRepository.findBySessionIdOrderByTimestampAsc(sessionId);
    }

    @Override
    public ChatSession getOrCreateChatSession(Long userId, String sessionId) {

        ChatSession session =
                chatSessionRepository.findBySessionId(sessionId);

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
        ChatSession session =
                chatSessionRepository.findBySessionId(sessionId);

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
