package com.example.ecommerce.service;

import com.example.ecommerce.entity.AppUser;
import com.example.ecommerce.entity.PasswordResetToken;
import com.example.ecommerce.repository.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepo;
    private final WebClient webClient;

    // 🔑 Brevo API Key (from Render env)
    @Value("${BREVO_API_KEY}")
    private String brevoApiKey;

    // ✅ Sender email (works with Brevo)
    private static final String FROM_EMAIL = "ravikiran939039@gmail.com";

    public PasswordResetService(PasswordResetTokenRepository tokenRepo) {
        this.tokenRepo = tokenRepo;
        this.webClient = WebClient.builder()
                .baseUrl("https://api.brevo.com/v3")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    // =========================
    // CREATE RESET TOKEN
    // =========================
    public String createToken(AppUser user) {

        tokenRepo.deleteByUser(user);

        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiryTime(LocalDateTime.now().plusMinutes(15));

        tokenRepo.save(token);
        return token.getToken();
    }

    // =========================
    // SEND RESET EMAIL (BREVO HTTP API)
    // =========================
    public void sendResetEmail(String to, String link) {

        String html =
                "<p>Hello,</p>" +
                "<p>You requested to reset your password.</p>" +

                "<p><b>Click the button below:</b></p>" +
                "<p><a href=\"" + link + "\" target=\"_blank\">Reset Password</a></p>" +

                "<br/>" +
                "<p><b>If the button does not work, copy and paste this link into your browser:</b></p>" +
                "<p>" + link + "</p>" +

                "<br/>" +
                "<p>This link will expire in <b>15 minutes</b>.</p>" +
                "<p>If you did not request this, you can safely ignore this email.</p>";

        Map<String, Object> body = Map.of(
                "sender", Map.of(
                        "email", FROM_EMAIL,
                        "name", "Ecommerce App"
                ),
                "to", new Object[]{
                        Map.of("email", to)
                },
                "subject", "Reset your password",
                "htmlContent", html
        );

        webClient.post()
                .uri("/smtp/email")
                .header("api-key", brevoApiKey)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block(); // send immediately
    }
}
