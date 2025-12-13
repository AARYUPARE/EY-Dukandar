package com.EY.dukandar.Service;

import com.EY.dukandar.Model.ChatHistory;
import com.EY.dukandar.Model.ChatRequest;
import com.EY.dukandar.Model.ChatResponse;
import com.EY.dukandar.Model.ChatSession;

import java.util.List;

public interface ChatService {

    ChatResponse processMessage(ChatRequest request);

    List<ChatHistory> getChatHistoryBySession(String sessionId);

    ChatSession getOrCreateChatSession(Long userId, String sessionId);

    void updateSessionActivity(String sessionId);
}
