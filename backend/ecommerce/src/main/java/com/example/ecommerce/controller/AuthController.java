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

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
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

    // ✅ REGISTER (UPDATED: returns JWT)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AppUser user) {

        if (repo.existsByEmail(user.getEmail())) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");
        user.setCreatedAt(LocalDateTime.now());

        repo.save(user);

        // ✅ generate JWT after successful register
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole()
        );

        return ResponseEntity.ok(token);
    }

    // ✅ LOGIN (UNCHANGED)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        Optional<AppUser> optionalUser = repo.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }

        AppUser user = optionalUser.get();

        boolean match = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if (!match) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }

        // ✅ SUCCESS → generate JWT
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole()
        );

        return ResponseEntity.ok(token);
    }
}
