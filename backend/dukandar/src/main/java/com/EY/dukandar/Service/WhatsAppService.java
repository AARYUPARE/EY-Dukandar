package com.EY.dukandar.Service;


import org.springframework.web.multipart.MultipartFile;


public interface WhatsAppService {

    void processIncoming(String payload);

    void sendMessage(String to, String message);

    String uploadMedia(byte[] bytes, String fileName) throws Exception;

    void sendImage(String phone,byte[] imageBytes, String caption, String id);
}

