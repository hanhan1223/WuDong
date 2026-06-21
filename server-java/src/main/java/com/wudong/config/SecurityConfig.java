package com.wudong.config;

import com.wudong.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Swagger / OpenAPI
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/api-docs/**",
                                "/v3/api-docs/**",
                                "/webjars/**"
                        ).permitAll()
                        // Public endpoints
                        .requestMatchers(
                                "/api/health",
                                "/api/users/register",
                                "/api/users/login",
                                "/api/users/send-sms",
                                "/api/users/login-sms",
                                "/api/admin/login"
                        ).permitAll()
                        // Public GET endpoints (browse without login)
                        .requestMatchers(HttpMethod.GET,
                                "/api/products",
                                "/api/products/hot",
                                "/api/products/categories",
                                "/api/products/{id}",
                                "/api/restaurants",
                                "/api/restaurants/{id}",
                                "/api/restaurants/{id}/dishes",
                                "/api/restaurants/{id}/timeslots",
                                "/api/farm/categories",
                                "/api/farm/products",
                                "/api/farm/products/{id}",
                                "/api/homestays",
                                "/api/homestays/{id}",
                                "/api/homestays/{id}/rooms",
                                "/api/homestays/rooms/{roomId}/calendar",
                                "/api/scenic-spots",
                                "/api/scenic-spots/{id}",
                                "/api/scenic-spots/{id}/tickets",
                                "/api/routes",
                                "/api/routes/{id}",
                                "/api/transport-guides",
                                "/api/e-tickets/{code}",
                                "/api/posts",
                                "/api/posts/{id}",
                                "/api/posts/{id}/comments",
                                "/api/topics",
                                "/api/search"
                        ).permitAll()
                        // Admin endpoints - ADMIN role only
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                        // Merchant endpoints - MERCHANT or ADMIN role
                        .requestMatchers("/api/merchant/**").hasAnyAuthority("ROLE_MERCHANT", "ROLE_ADMIN")
                        // All other requests require authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}
