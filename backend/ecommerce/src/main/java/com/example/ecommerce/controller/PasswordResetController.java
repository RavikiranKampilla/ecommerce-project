package com.example.ecommerce.controller;

import com.example.ecommerce.entity.AppUser;
import com.example.ecommerce.entity.PasswordResetToken;
import com.example.ecommerce.repository.AppUserRepository;
import com.example.ecommerce.repository.PasswordResetTokenRepository;
import com.example.ecommerce.service.EmailService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "https://ecommerce-project-five-delta.vercel.app"
    }
)
public class PasswordResetController {

    private final AppUserRepository userRepo;
    private final PasswordResetTokenRepository tokenRepo;
    private final EmailService emailService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public PasswordResetController(
            AppUserRepository userRepo,
            PasswordResetTokenRepository tokenRepo,
            EmailService emailService) {
        this.userRepo = userRepo;
        this.tokenRepo = tokenRepo;
        this.emailService = emailService;
    }

    // =========================
    // FORGOT PASSWORD (FIXED)
    // =========================
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {

        userRepo.findByEmail(email).ifPresent(user -> {

            // ✅ CRITICAL FIX: remove old token if exists
            tokenRepo.findAll().stream()
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .forEach(tokenRepo::delete);

            PasswordResetToken token = new PasswordResetToken();
            token.setToken(UUID.randomUUID().toString());
            token.setUser(user);
            token.setExpiryTime(LocalDateTime.now().plusMinutes(15));

            tokenRepo.save(token);

            String resetLink =
                "https://ecommerce-project-five-delta.vercel.app/reset-password?token="
                + token.getToken();

            try {
                emailService.sendResetLink(user.getEmail(), resetLink);
            } catch (Exception e) {
                // ❗ Never crash API due to email failure
                System.err.println("Email send failed: " + e.getMessage());
            }
        });

        // ✅ SAME RESPONSE ALWAYS (SECURITY)
        return ResponseEntity.ok(
            "If the email exists, a password reset link has been sent"
        );
    }

    // =========================
    // RESET PASSWORD
    // =========================
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword) {

        PasswordResetToken resetToken = tokenRepo.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (resetToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        AppUser user = resetToken.getUser();
        user.setPassword(encoder.encode(newPassword));
        userRepo.save(user);

        tokenRepo.delete(resetToken);

        return ResponseEntity.ok("Password updated successfully");
    }
}
