package com.example.ecommerce.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        // ✅ ALLOW FRONTEND DOMAINS
        config.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "https://ecommerce-project-five-delta.vercel.app"
        ));

        // ✅ ALLOW METHODS
        config.setAllowedMethods(List.of(
            "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));

        // ✅ ALLOW HEADERS
        config.setAllowedHeaders(List.of("*"));

        // ✅ REQUIRED FOR JWT / AUTH
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
