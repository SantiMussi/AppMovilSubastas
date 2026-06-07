package com.subastas.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(request -> request
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/api-docs/**", "/v3/api-docs/**")
                        .permitAll()
                        .requestMatchers("/error/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/actuator/health", "/actuator/health/**").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/register").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/auth/register/status").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/complete").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/forgot").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/validate-reset-code").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/reset").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/v1/auctions/active").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/auctions/{id}").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/v1/auctions/{idSubasta}/catalog").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/catalogs/{idCatalogo}/items").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/v1/auction-items/{auctionItemId}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/auction-items/{auctionItemId}/top-bid").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/auction-items/{auctionItemId}/bids").permitAll()
                        .requestMatchers("/ws/**").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/v1/products/{productId}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/{productId}/photos").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/photos/{photoId}/content").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/paises").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/paises/{id}").permitAll()

                        .requestMatchers("/api/v1/admin/**").hasAuthority("ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/v1/auctions").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/paises").hasAuthority("ADMIN")

                        .requestMatchers("/api/v1/users/me/**").authenticated()
                        .requestMatchers("/api/v1/users/me").authenticated()

                        .requestMatchers(HttpMethod.POST, "/api/v1/proposals").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/proposals/{proposalId}").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/proposals/{proposalId}/terms").authenticated()

                        .requestMatchers(HttpMethod.GET, "/api/v1/sales/me/proposals/{proposalId}").authenticated()
                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}