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

    private final JavaMailSender mailSender;
    private final PasswordResetTokenRepository tokenRepo;

    public PasswordResetService(
            JavaMailSender mailSender,
            PasswordResetTokenRepository tokenRepo
    ) {
        this.mailSender = mailSender;
        this.tokenRepo = tokenRepo;
    }

    @Transactional
    public void createTokenAndSendEmail(AppUser user, String frontendUrl) {

        // delete old token safely (NOW inside transaction)
        tokenRepo.deleteByUser(user);

        PasswordResetToken token = new PasswordResetToken();
        token.setToken(UUID.randomUUID().toString());
        token.setUser(user);
        token.setExpiryTime(LocalDateTime.now().plusMinutes(15));

        tokenRepo.save(token);

        String resetLink =
                frontendUrl + "/reset-password?token=" + token.getToken();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("Ecommerce Support <no-reply@ecommerce.com>");
        message.setTo(user.getEmail());
        message.setSubject("Reset Your Password");
        message.setText(
                "Click the link below to reset your password:\n\n" +
                resetLink +
                "\n\nThis link expires in 15 minutes."
        );

        mailSender.send(message);
    }
}
