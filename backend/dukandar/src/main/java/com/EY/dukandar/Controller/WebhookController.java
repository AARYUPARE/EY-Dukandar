package com.EY.dukandar.Controller;

import com.EY.dukandar.Model.SendImageRequest;
import com.EY.dukandar.Service.WhatsAppService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/webhook")
@RequiredArgsConstructor
public class WebhookController
{

    @Autowired
    private final WhatsAppService whatsAppService;

    // 🔹 Verification (Meta handshake)
    @GetMapping
    public ResponseEntity<String> verify(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.verify_token") String token,
            @RequestParam("hub.challenge") String challenge) {

        if ("subscribe".equals(mode) && token.equals("dukandar_verify_token")) {
            return ResponseEntity.ok(challenge);
        }

        return ResponseEntity.status(403).build();
    }

    // 🔹 Incoming messages
    @PostMapping
    public ResponseEntity<Void> receive(@RequestBody String payload) {

        whatsAppService.processIncoming(payload);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/send/image")
    public ResponseEntity<String> sendImage(
            @RequestBody SendImageRequest req
    ) {

        whatsAppService.sendImage(req.phone, req.imageBytes, req.caption, req.name);

        return ResponseEntity.ok("Image sent successfully");
    }

    @GetMapping("/qr/{name}")
    public ResponseEntity<byte[]> serveQr(@PathVariable String name) throws IOException {

        System.out.println("🔥 QR REQUEST RECEIVED for: " + name);

        Path path = Paths.get("dukandar/uploads/qr/" + name + ".png");

        System.out.println("Looking at path: " + path.toAbsolutePath());

        if (!Files.exists(path)) {
            System.out.println("❌ FILE NOT FOUND");
            return ResponseEntity.notFound().build();
        }

        byte[] bytes = Files.readAllBytes(path);

        System.out.println("✅ FILE FOUND, size = " + bytes.length);

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .contentLength(bytes.length)
                .body(bytes);
    }

}

