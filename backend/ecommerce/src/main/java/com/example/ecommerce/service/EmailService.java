package com.example.ecommerce.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendResetLink(String toEmail, String link) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);          // REQUIRED FOR GMAIL
        message.setTo(toEmail);
        message.setSubject("Password Reset - E-Commerce");
        message.setText(
                "Click the link below to reset your password:\n\n" +
                link + "\n\n" +
                "This link expires in 15 minutes.\n\n" +
                "If you did not request this, ignore this email."
        );

        mailSender.send(message);
    }
}
