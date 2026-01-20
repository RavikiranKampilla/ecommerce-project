package com.example.ecommerce.service;

import com.example.ecommerce.entity.AppUser;
import com.example.ecommerce.entity.PasswordResetToken;
import com.example.ecommerce.repository.PasswordResetTokenRepository;
import jakarta.transaction.Transactional;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepo;
    private final JavaMailSender mailSender;

    public PasswordResetService(
            PasswordResetTokenRepository tokenRepo,
            JavaMailSender mailSender
    ) {
        this.tokenRepo = tokenRepo;
        this.mailSender = mailSender;
    }

    // ======================
    // DB TRANSACTION ONLY
    // ======================
    @Transactional
    public String createToken(AppUser user) {

        tokenRepo.deleteByUser(user);

        PasswordResetToken token = new PasswordResetToken();
        token.setToken(UUID.randomUUID().toString());
        token.setUser(user);
        token.setExpiryTime(LocalDateTime.now().plusMinutes(15));

        tokenRepo.save(token);
        return token.getToken();
    }

    // ======================
    // EMAIL (NO TRANSACTION)
    // ======================
    public void sendResetEmail(String email, String link) {

        try {
            SimpleMailMessage message = new SimpleMailMessage();

            // ✅ MUST MATCH VERIFIED BREVO SENDER EXACTLY
            message.setFrom("ravikiran939039@gmail.com");

            message.setTo(email);
            message.setSubject("Reset Your Password");
            message.setText(
                "Click the link below to reset your password:\n\n" +
                link +
                "\n\nThis link expires in 15 minutes."
            );

            mailSender.send(message);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Email sending failed");
        }
    }
}
