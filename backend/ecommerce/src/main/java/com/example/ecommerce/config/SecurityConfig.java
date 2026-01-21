package com.example.ecommerce.config;

import com.example.ecommerce.security.JwtFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            // ❌ CSRF not needed for JWT
            .csrf(csrf -> csrf.disable())

            // ✅ ENABLE CORS (uses CorsConfig)
            .cors(cors -> {})

            // ❌ Stateless JWT
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // ❌ Disable default auth
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            // ✅ Proper 401 response
            .exceptionHandling(ex -> ex.authenticationEntryPoint(
                (req, res, exx) ->
                    res.sendError(HttpServletResponse.SC_UNAUTHORIZED)
            ))

            .authorizeHttpRequests(auth -> auth

                // 🔥 MUST: allow CORS preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // 🔥 MUST: allow root (wake Render)
                .requestMatchers(
                    "/",
                    "/auth/**",
                    "/products/**",
                    "/categories/**",
                    "/error"
                ).permitAll()

                // USER
                .requestMatchers(HttpMethod.POST, "/orders").authenticated()
                .requestMatchers(HttpMethod.GET, "/orders").authenticated()

                // ADMIN
                .requestMatchers("/orders/admin/**").hasRole("ADMIN")

                // EVERYTHING ELSE
                .anyRequest().authenticated()
            )

            // ✅ JWT FILTER
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
