package com.example.ecommerce.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class PasswordResetService {

    private final JavaMailSender mailSender;

    public PasswordResetService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendResetEmail(String toEmail, String resetLink) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("Ecommerce Support <your_verified_email@gmail.com>");
        message.setTo(toEmail);
        message.setSubject("Reset Your Password");
        message.setText(
            "Click the link below to reset your password:\n\n" + resetLink +
            "\n\nThis link expires in 15 minutes."
        );

        mailSender.send(message);
    }
}
