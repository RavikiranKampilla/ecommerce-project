package com.example.ecommerce.controller;

import com.example.ecommerce.entity.AppUser;
import com.example.ecommerce.repository.AppUserRepository;
import com.example.ecommerce.dto.LoginRequest;
import com.example.ecommerce.security.JwtUtil;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Map; // ✅ ADDED

@RestController
@RequestMapping("/auth")
@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "https://ecommerce-project-five-delta.vercel.app"
    },
    allowCredentials = "true"
)
public class AuthController {

    private final AppUserRepository repo;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(AppUserRepository repo,
                          BCryptPasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AppUser user) {

        if (repo.existsByEmail(user.getEmail())) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("ROLE_USER"); // ✅ CHANGED (was USER)
        user.setCreatedAt(LocalDateTime.now());

        repo.save(user);

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole()
        );

        // ✅ CHANGED: return JSON instead of plain string
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        Optional<AppUser> optionalUser = repo.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }

        AppUser user = optionalUser.get();

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole()
        );

        // ✅ CHANGED: return JSON instead of plain string
        return ResponseEntity.ok(Map.of("token", token));
    }
}
