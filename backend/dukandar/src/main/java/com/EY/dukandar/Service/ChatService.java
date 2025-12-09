package com.EY.dukandar.Service;

import com.EY.dukandar.Model.ChatRequest;
import com.EY.dukandar.Model.ChatHistory;
import com.EY.dukandar.Model.ChatSession;

import java.util.List;

public interface ChatService {

    // Process user message, call LangChain agent, save chat, update session, return bot reply
    String processMessage(ChatRequest request);

    // Get chat history for a session
    List<ChatHistory> getChatHistoryBySession(String sessionId);

    // Get or create a chat session
    ChatSession getOrCreateChatSession(Long userId, String sessionId);

    // Update last active timestamp of a session
    void updateSessionActivity(String sessionId);
}
