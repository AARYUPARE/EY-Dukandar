package com.EY.dukandar.Service;

import com.EY.dukandar.Model.ChatRequest;
import com.EY.dukandar.Model.ChatResponse;
import com.EY.dukandar.Model.User;
import com.EY.dukandar.Repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;


import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WhatsAppServiceImplementation implements WhatsAppService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatService chatService;

    private final RestTemplate restTemplate = new RestTemplate();

    private final String ACCESS_TOKEN =
    "EAAdJ1D75nt0BQp3TsCZBkqniBxZAbwYXhaWNca8yLnFuHB0gMqjCpkZC7AXZA5PguJ4e4Px5yjIR5pPVPvUEyTyoXJhROnyaXFjni04LiB4hvciXdAXSdzjkFWJguzZCEfTX2BMDwClptlo0Hu2UyKd3kIq841pwuhwmIlJ6k4FO3YkEMpdle4BF8jhOXzUriWLjZBr4oo2ZBzpaZCyAs4nXB2kRbpHQFjuAzTYALOJ7pLNInt7NgZAxd2tJgkSZCNhyKJ46Q4BNoLZBMZCo8fjVnyYY34UvbgZDZD";
    private final String PHONE_NUMBER_ID = "904317979441773";

    @Override
    public void processIncoming(String payload) {

        try {
            ObjectMapper mapper = new ObjectMapper();

            JsonNode root = mapper.readTree(payload);

            JsonNode msgNode =
                    root.path("entry").get(0)
                            .path("changes").get(0)
                            .path("value")
                            .path("messages").get(0);

            if (msgNode == null) return;

            System.out.println("Message from whatsapp: " + msgNode);

            String from = msgNode.path("from").asText();
            String text = msgNode.path("text").path("body").asText();

            System.out.println("User: " + from + " -> " + text);

            String mob = "";

            if (from.startsWith("91")) {
                mob = from.substring(2);
            }

            User user = userRepository.findByPhone(mob);

            ChatRequest req = new ChatRequest();
            req.setUserId(user.getId());
            req.setSessionId(user.getId().toString());
            req.setMessage(text);


            ChatResponse chatResponse = chatService.processMessage(req);
            // 🔥 For now echo
            sendMessage(from, chatResponse.getReply());

            // 🔥 Later:
            // call LangChain here
            // String reply = langChainService.ask(text);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    @Override
    public void sendMessage(String to, String message) {

        String url = "https://graph.facebook.com/v19.0/"
                + PHONE_NUMBER_ID + "/messages";

        Map<String, Object> body = Map.of(
                "messaging_product", "whatsapp",
                "to", to,
                "text", Map.of("body", message)
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(ACCESS_TOKEN);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(body, headers);

        restTemplate.postForEntity(url, entity, String.class);
    }

    @Override
    public String uploadMedia(byte[] bytes, String fileName) throws Exception {

        String url = "https://graph.facebook.com/v22.0/" + PHONE_NUMBER_ID + "/media";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(ACCESS_TOKEN);

        ByteArrayResource resource = new ByteArrayResource(bytes) {
            @Override
            public String getFilename() {
                return fileName;
            }
        };

        HttpHeaders fileHeaders = new HttpHeaders();
        fileHeaders.setContentType(MediaType.IMAGE_PNG); // 🔥 THIS FIXES EVERYTHING

        HttpEntity<ByteArrayResource> fileEntity =
                new HttpEntity<>(resource, fileHeaders);

        MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
        form.add("messaging_product", "whatsapp");
        form.add("file", fileEntity);

        HttpEntity<MultiValueMap<String, Object>> request =
                new HttpEntity<>(form, headers);

        ResponseEntity<String> response =
                restTemplate.postForEntity(url, request, String.class);

        JsonNode json = new ObjectMapper().readTree(response.getBody());

        System.out.println("🔥 Media upload response = " + json);

        return json.get("id").asText();
    }



    @Override
    public void sendImage(String phone, byte[] imageBytes, String caption, String name) {

        try {

            // ✅ format phone
            if (!phone.startsWith("91")) {
                phone = "91" + phone;
            }

//
            String mediaId = uploadMedia(imageBytes, name);

            // =========================
            // STEP 2 — Send message using mediaId
            // =========================
            String url = "https://graph.facebook.com/v19.0/"
                    + PHONE_NUMBER_ID + "/messages";

            Map<String, Object> imageObj = new HashMap<>();
            imageObj.put("id", mediaId);      // 🔥 IMPORTANT (NOT link)
            imageObj.put("caption", caption);

            Map<String, Object> body = new HashMap<>();
            body.put("messaging_product", "whatsapp");
            body.put("to", phone);
            body.put("type", "image");
            body.put("image", imageObj);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(ACCESS_TOKEN);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request =
                    new HttpEntity<>(body, headers);

            ResponseEntity<String> response =
                    restTemplate.postForEntity(url, request, String.class);

            System.out.println("🔥 Image sent successfully to " + phone);
            System.out.println(response.getBody());

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("❌ Failed to send image");
        }
    }
}

