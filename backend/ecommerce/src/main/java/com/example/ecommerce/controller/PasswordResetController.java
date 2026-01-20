package com.example.ecommerce.controller;

import com.example.ecommerce.entity.AppUser;
import com.example.ecommerce.entity.PasswordResetToken;
import com.example.ecommerce.repository.AppUserRepository;
import com.example.ecommerce.repository.PasswordResetTokenRepository;
import com.example.ecommerce.service.PasswordResetService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
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
    private final PasswordResetService passwordResetService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public PasswordResetController(
            AppUserRepository userRepo,
            PasswordResetTokenRepository tokenRepo,
            PasswordResetService passwordResetService
    ) {
        this.userRepo = userRepo;
        this.tokenRepo = tokenRepo;
        this.passwordResetService = passwordResetService;
    }

    // =========================
    // FORGOT PASSWORD
    // =========================
    @PostMapping("/forgot-password")
    @Transactional
    public ResponseEntity<String> forgotPassword(
            @RequestBody Map<String, String> body
    ) {

        String email = body.get("email");

        userRepo.findByEmail(email).ifPresent(user -> {

            // ✅ now runs inside transaction
            tokenRepo.deleteByUser(user);

            PasswordResetToken token = new PasswordResetToken();
            token.setToken(UUID.randomUUID().toString());
            token.setUser(user);
            token.setExpiryTime(LocalDateTime.now().plusMinutes(15));

            tokenRepo.save(token);

            String resetLink =
                "https://ecommerce-project-five-delta.vercel.app/reset-password?token="
                + token.getToken();

            passwordResetService.sendResetEmail(user.getEmail(), resetLink);
        });

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
            @RequestParam String newPassword
    ) {

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
