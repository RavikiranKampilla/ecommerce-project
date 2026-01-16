package com.example.ecommerce.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendResetLink(String toEmail, String link) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Password Reset - E-Commerce");
        message.setText(
                "Click the link below to reset your password:\n\n" +
                link + "\n\n" +
                "This link expires in 15 minutes."
        );

        mailSender.send(message);
    }
}
