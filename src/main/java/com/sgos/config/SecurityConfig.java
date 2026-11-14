package com.sgos.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // AUTENTICACIÓN

                        // Inicio de sesión público
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/usuarios/login"
                        ).permitAll()
                        // USUARIOS

                        // Solo administradores pueden gestionar usuarios
                        .requestMatchers("/api/usuarios/**")
                        .hasRole("ADMINISTRADOR")
                        // CLIENTES

                        // Solo administradores pueden modificar clientes
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/clientes/**"
                        ).hasRole("ADMINISTRADOR")
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/clientes/**"
                        ).hasRole("ADMINISTRADOR")
                        // Solo administradores pueden eliminar clientes
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/clientes/**"
                        ).hasRole("ADMINISTRADOR")
                        // Administradores y técnicos pueden consultar clientes
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/clientes",
                                "/api/clientes/**"
                        ).hasAnyRole("ADMINISTRADOR", "TECNICO")
                        // Administradores y técnicos pueden crear clientes
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/clientes",
                                "/api/clientes/**"
                        ).hasAnyRole("ADMINISTRADOR", "TECNICO")
                        // ÓRDENES DE SERVICIO

                        // Solo administradores pueden eliminar órdenes
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/ordenesservicios/**"
                        ).hasRole("ADMINISTRADOR")
                        // Solo administradores pueden modificar datos de órdenes
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/ordenesservicios/**"
                        ).hasRole("ADMINISTRADOR")
                        // Solo administradores pueden consultar todas las órdenes
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/ordenesservicios"
                        ).hasRole("ADMINISTRADOR")
                        // Administradores y técnicos pueden consultar sus órdenes
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/ordenesservicios/mis-ordenes"
                        ).hasAnyRole("ADMINISTRADOR", "TECNICO")
                        // Administradores y técnicos pueden crear órdenes
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/ordenesservicios"
                        ).hasAnyRole("ADMINISTRADOR", "TECNICO")
                        // Administradores y técnicos pueden cambiar estados
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/ordenesservicios/*/estado"
                        ).hasAnyRole("ADMINISTRADOR", "TECNICO")
                        // Administradores y técnicos pueden consultar
                        // órdenes individuales
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/ordenesservicios/*"
                        ).hasAnyRole("ADMINISTRADOR", "TECNICO")
                          // SEGUIMIENTOS

                        // Administradores y técnicos pueden consultar seguimientos
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/ordenesservicios/*/seguimientos"
                        ).hasAnyRole("ADMINISTRADOR", "TECNICO")

                        // Administradores y técnicos pueden registrar seguimientos
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/ordenesservicios/*/seguimientos"
                        ).hasAnyRole("ADMINISTRADOR", "TECNICO")
                        // ESTADOS

                        // Administradores y técnicos pueden consultar estados
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/estados"
                        ).hasAnyRole("ADMINISTRADOR", "TECNICO")
                        // OTRAS RUTAS

                        
                        // de manera predeterminada, pero no se permite el acceso a ninguna otra ruta
                        .anyRequest().denyAll()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                        )
                );

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {

        JwtAuthenticationConverter converter
                = new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(jwt -> {

            String rol = jwt.getClaimAsString("rol");

            if (rol == null || rol.isBlank()) {
                return List.of();
            }

            return List.of(
                    new SimpleGrantedAuthority("ROLE_" + rol)
            );
        });

        return converter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:3000"
        ));

        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of(
                "Authorization", "Content-Type"
        ));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source
                = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
