package com.example.ecommerce.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final ResendEmailService resendEmailService;

    public EmailService(ResendEmailService resendEmailService) {
        this.resendEmailService = resendEmailService;
    }

    public void sendResetLink(String toEmail, String link) {
        resendEmailService.sendResetEmail(toEmail, link);
    }
}
