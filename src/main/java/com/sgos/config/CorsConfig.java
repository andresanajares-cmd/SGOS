package com.sgos.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración global de CORS (Cross-Origin Resource Sharing).
 * Permite que el frontend React, servido en otro puerto/origen,
 * pueda consumir esta API sin ser bloqueado por el navegador.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // aplica a todos los endpoints bajo /api
                .allowedOrigins(
                        "http://localhost:5173", // Vite
                        "http://localhost:3000"  // Create React App
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
