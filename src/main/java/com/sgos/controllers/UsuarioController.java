
package com.sgos.controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sgos.dto.LoginRequest;
import com.sgos.dto.LoginResponse;
import com.sgos.entities.Usuarios;
import com.sgos.repositories.UsuariosRepository;
import com.sgos.security.JwtService;
import com.sgos.services.UsuariosSeriviceManager;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuariosSeriviceManager usuarioService;

    @Autowired
    private UsuariosRepository usuariosRepository;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/registro")
    public ResponseEntity<?> registro(@RequestBody Usuarios usuario) {

        try {
            Usuarios nuevoUsuario =
                usuarioService.registerUser(usuario);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                    "mensaje", "Usuario registrado correctamente",
                    "id", nuevoUsuario.getId(),
                    "nombre", nuevoUsuario.getNombre(),
                    "correo", nuevoUsuario.getCorreo(),
                    "rol", nuevoUsuario.getRol().getNombre()
                )
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage())
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        if (request.correo() == null ||
            request.contrasena() == null ||
            request.correo().isBlank() ||
            request.contrasena().isBlank()) {

            return ResponseEntity.badRequest().body(
                Map.of("error", "Correo y contraseña son obligatorios")
            );
        }

        boolean autenticado = usuarioService.authenticateUser(
            request.correo(),
            request.contrasena()
        );

        if (!autenticado) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("error", "Credenciales incorrectas")
            );
        }

        Usuarios usuario = usuariosRepository
            .findByCorreo(request.correo())
            .orElseThrow();

        String token = jwtService.generarToken(usuario);

        LoginResponse respuesta = new LoginResponse(
            token,
            "Bearer",
            usuario.getId(),
            usuario.getNombre(),
            usuario.getCorreo(),
            usuario.getRol().getNombre()
        );

        return ResponseEntity.ok(respuesta);
    }
}
