package com.EY.dukandar.Controller;

import com.EY.dukandar.Model.ChatRequest;
import com.EY.dukandar.Service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public String chat(@RequestBody ChatRequest request) {
        return chatService.processMessage(request);
    }
}
