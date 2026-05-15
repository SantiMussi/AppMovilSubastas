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
                        // Permitir pre-flight requests de CORS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Rutas Públicas
                        .requestMatchers(HttpMethod.GET, "/api/v1/auctions/active").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/paises").permitAll()
                        .requestMatchers("/api/v1/auth/**").permitAll()

                        // Documentación (Swagger)
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/api-docs/**", "/v3/api-docs/**")
                        .permitAll()

                        // Rutas Protegidas: Requieren JWT
                        // Usuarios, Perfil, Medios de Pago y Bienes Consignados
                        .requestMatchers("/api/v1/users/me/**").authenticated()

                        // Subastas, Catálogos e Ítems
                        .requestMatchers("/api/v1/auctions/**").authenticated()
                        .requestMatchers("/api/v1/catalogs/**").authenticated()
                        .requestMatchers("/api/v1/auction-items/**").authenticated()

                        // Propuestas de Bienes
                        .requestMatchers("/api/v1/proposals/**").authenticated()

                        // Manejo de errores
                        .requestMatchers("/error/**").permitAll()

                        // Cualquier otra petición debe estar autenticada
                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Tu configuración de CORS actual es correcta para desarrollo
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