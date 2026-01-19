package com.example.ecommerce.repository;

import com.example.ecommerce.entity.PasswordResetToken;
import com.example.ecommerce.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    // ✅ CRITICAL FIX (delete old token before creating new)
    void deleteByUser(AppUser user);
}
