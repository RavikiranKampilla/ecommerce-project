package com.example.ecommerce.service;

import com.example.ecommerce.entity.AppUser;
import com.example.ecommerce.entity.PasswordResetToken;
import com.example.ecommerce.repository.PasswordResetTokenRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepo;
    private final JavaMailSender mailSender;

    // ✅ HARD-CODED FROM (SAFE WITH BREVO)
    private static final String FROM_EMAIL = "ravikiran939039@gmail.com";

    public PasswordResetService(
            PasswordResetTokenRepository tokenRepo,
            JavaMailSender mailSender
    ) {
        this.tokenRepo = tokenRepo;
        this.mailSender = mailSender;
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
    // SEND RESET EMAIL
    // =========================
    public void sendResetEmail(String to, String link) {

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(FROM_EMAIL);   // 🔥 THIS FIXES 500
        mail.setTo(to);
        mail.setSubject("Reset your password");
        mail.setText(
            "Click the link below to reset your password:\n\n" +
            link +
            "\n\nThis link will expire in 15 minutes."
        );

        mailSender.send(mail);
    }
}
