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
                        // ── Permitir pre-flight requests de CORS ──
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ── Documentación (Swagger) ──
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/api-docs/**", "/v3/api-docs/**")
                        .permitAll()

                        // ── Manejo de errores ──
                        .requestMatchers("/error/**").permitAll()

                        // ── Monitoreo de salud (Actuator) ──
                        .requestMatchers(HttpMethod.GET, "/actuator/health", "/actuator/health/**").permitAll()

                        // PERMITALL

                        // Autenticación
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/register").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/auth/register/status").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/complete").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/forgot").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/validate-reset-code").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/reset").permitAll()

                        // Subastas (solo lectura pública)
                        .requestMatchers(HttpMethod.GET, "/api/v1/auctions/active").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/auctions/{id}").permitAll()

                        // Catálogos e Ítems de subasta (solo lectura pública)
                        .requestMatchers(HttpMethod.GET, "/api/v1/auctions/{idSubasta}/catalog").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/catalogs/{idCatalogo}/items").permitAll()

                        // Artículos de subasta, pujas (solo lectura pública)
                        .requestMatchers(HttpMethod.GET, "/api/v1/auction-items/{auctionItemId}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/auction-items/{auctionItemId}/top-bid").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/auction-items/{auctionItemId}/bids").permitAll()

                        // Productos y fotos (solo lectura pública)
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/{productId}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/{productId}/photos").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/photos/{photoId}/content").permitAll()

                        // Países (lectura pública para el combo de registro)
                        .requestMatchers(HttpMethod.GET, "/api/paises").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/paises/{id}").permitAll()

                        // ADMIN
                        // Todo el prefijo /api/v1/admin/
                        .requestMatchers("/api/v1/admin/**").hasAuthority("ADMIN")

                        // Listar TODAS las subastas (incluyendo borradores y pasadas)
                        // GET /api/v1/auctions (sin sub-path) es solo para admins
                        .requestMatchers(HttpMethod.GET, "/api/v1/auctions").hasAuthority("ADMIN")

                        // Gestión interna: crear países
                        .requestMatchers(HttpMethod.POST, "/api/paises").hasAuthority("ADMIN")

                        // Authenticated
                        // Panel de Usuario (perfil, foto, multas)
                        .requestMatchers("/api/v1/users/me/**").authenticated()
                        .requestMatchers("/api/v1/users/me").authenticated()

                        // Propuestas de Artículos
                        .requestMatchers(HttpMethod.POST, "/api/v1/proposals").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/proposals/{proposalId}").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/proposals/{proposalId}/terms").authenticated()

                        // Resultado de venta
                        .requestMatchers(HttpMethod.GET, "/api/v1/sales/me/proposals/{proposalId}").authenticated()

                        // Cualquier peticion autenticada
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