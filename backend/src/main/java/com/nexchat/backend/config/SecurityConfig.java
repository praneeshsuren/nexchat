package com.nexchat.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration; // Add this
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;
import org.springframework.security.config.Customizer;
import org.springframework.core.annotation.Order;
// import org.springframework.http.HttpMethod; // no longer used

@Configuration // Make sure this annotation is present
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    @Order(1)
    public SecurityFilterChain wsSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/ws-chat/**") // Matcher for all ws-chat paths
            .authorizeHttpRequests(authz -> authz.anyRequest().permitAll()) // Permit all for SockJS
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults()); // Use the 'corsFilter' bean
        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain appSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                // Any other paths that need to be public
                .requestMatchers("/", "/static/**", "/webjars/**").permitAll()
                // Temporarily permit unauthenticated reads for message history while diagnosing token 401s
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/channels/**", "/api/direct/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/direct/messages").permitAll()
                // Also allow users listing while wiring UI (will re-secure later)
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/users").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults())) // Use JWT for resource server
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults()); // Use the 'corsFilter' bean
        return http.build();
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // ** Allow your React app's origin **
        config.setAllowedOrigins(List.of("http://localhost:5173")); 
        
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*")); // Allow all headers
        config.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this config to all paths
        source.registerCorsConfiguration("/**", config); 
        return new CorsFilter(source);
    }
}