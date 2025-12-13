package com.EY.dukandar.Controller;

import com.EY.dukandar.Model.ChatRequest;
import com.EY.dukandar.Model.ChatResponse;
import com.EY.dukandar.Service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request) {

        System.out.println("Received chat request:");
        System.out.println("UserId: " + request.getUserId());
        System.out.println("SessionId: " + request.getSessionId());
        System.out.println("Message: " + request.getMessage());

        // Service already returns ChatResponse → just return it
        ChatResponse response = chatService.processMessage(request);

        return response;
    }
}
