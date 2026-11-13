
package com.sgos.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.sgos.entities.Rol;
import com.sgos.entities.Usuarios;
import com.sgos.repositories.RolRepository;
import com.sgos.repositories.UsuariosRepository;

@Configuration
public class AdminInitializer {

    @Bean
    public CommandLineRunner inicializarAdministrador(
            UsuariosRepository usuariosRepository,
            RolRepository rolRepository,
            PasswordEncoder passwordEncoder,
            @Value("${sgos.admin.email:}") String adminEmail,
            @Value("${sgos.admin.password:}") String adminPassword) {

        return args -> {

            // No crear cuentas si no se configuró el administrador inicial
            if (adminEmail.isBlank() || adminPassword.isBlank()) {
                return;
            }

            // Evitar crear otra cuenta con el mismo correo
            if (usuariosRepository.existsByCorreo(adminEmail)) {
                System.out.println(
                    "El correo del administrador inicial ya existe."
                );
                return;
            }

            // Evitar que se creen administradores adicionales
            // mediante este mecanismo
            if (usuariosRepository.existsByRol_Nombre("ADMINISTRADOR")) {
                return;
            }

            if (adminPassword.length() < 12) {
                throw new IllegalArgumentException(
                    "La contraseña inicial debe tener al menos 12 caracteres"
                );
            }

            Rol rolAdmin = rolRepository
                .findByNombre("ADMINISTRADOR")
                .orElseThrow(() -> new IllegalStateException(
                    "No existe el rol ADMINISTRADOR"
                ));

            Usuarios administrador = new Usuarios();

            administrador.setNombre("Administrador SGOS");
            administrador.setCorreo(adminEmail);
            administrador.setContrasena(
                passwordEncoder.encode(adminPassword)
            );
            administrador.setRol(rolAdmin);
            administrador.setActivo(true);

            usuariosRepository.save(administrador);

            System.out.println(
                "Administrador inicial creado correctamente."
            );
        };
    }
}
