package com.wudong.config;

import com.wudong.common.constants.SecurityConstants;
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
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Swagger / OpenAPI
                        .requestMatchers(SecurityConstants.SWAGGER_PATHS.toArray(new String[0])).permitAll()
                        // Public endpoints (login/register)
                        .requestMatchers(SecurityConstants.PUBLIC_ENDPOINTS.toArray(new String[0])).permitAll()
                        // Public GET endpoints (browse without login)
                        .requestMatchers(HttpMethod.GET,
                                SecurityConstants.PUBLIC_GET_ENDPOINTS.toArray(new String[0])).permitAll()
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
