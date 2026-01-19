package com.example.ecommerce.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class ResendEmailService {

    @Value("${resend.api.key}")
    private String resendApiKey;

    private static final String RESEND_URL = "https://api.resend.com/emails";

    public void sendResetLink(String toEmail, String resetLink) {

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(resendApiKey);

        Map<String, Object> body = Map.of(
                "from", "Ravikiran <ravikiran939039@gmail.com>",
                "to", new String[]{toEmail},
                "subject", "Password Reset - E-Commerce",
                "html",
                "<p>Click below to reset your password:</p>" +
                "<p><a href=\"" + resetLink + "\">Reset Password</a></p>" +
                "<p>Expires in 15 minutes.</p>"
        );

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(body, headers);

        ResponseEntity<String> response =
                restTemplate.postForEntity(RESEND_URL, request, String.class);

        System.out.println("RESEND STATUS: " + response.getStatusCode());
        System.out.println("RESEND BODY: " + response.getBody());
    }
}
