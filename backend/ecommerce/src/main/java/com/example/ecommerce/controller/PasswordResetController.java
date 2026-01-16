package com.example.ecommerce.controller;

import com.example.ecommerce.entity.AppUser;
import com.example.ecommerce.entity.PasswordResetToken;
import com.example.ecommerce.repository.AppUserRepository;
import com.example.ecommerce.repository.PasswordResetTokenRepository;
import com.example.ecommerce.service.EmailService;   // ✅ added
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class PasswordResetController {

    private final AppUserRepository userRepo;
    private final PasswordResetTokenRepository tokenRepo;
    private final EmailService emailService;          // ✅ added
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // ✅ updated constructor
    public PasswordResetController(AppUserRepository userRepo,
                                   PasswordResetTokenRepository tokenRepo,
                                   EmailService emailService) {
        this.userRepo = userRepo;
        this.tokenRepo = tokenRepo;
        this.emailService = emailService;
    }

    // ✅ FORGOT PASSWORD
    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestParam String email) {

        AppUser user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not registered"));

        PasswordResetToken token = new PasswordResetToken();
        token.setToken(UUID.randomUUID().toString());
        token.setUser(user);
        token.setExpiryTime(LocalDateTime.now().plusMinutes(15));

        tokenRepo.save(token);

        // ✅ SEND EMAIL (replaced console log)
        String link = "http://localhost:5173/reset-password?token=" + token.getToken();
        emailService.sendResetLink(user.getEmail(), link);

        return "Password reset link sent to email";
    }

    // ✅ RESET PASSWORD
    @PostMapping("/reset-password")
    public String resetPassword(@RequestParam String token,
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

        return "Password updated successfully";
    }
}
