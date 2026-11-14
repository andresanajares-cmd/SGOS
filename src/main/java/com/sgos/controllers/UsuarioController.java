package com.sgos.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sgos.dto.CambiarEstadoRequest;
import com.sgos.dto.CrearUsuarioRequest;
import com.sgos.dto.LoginRequest;
import com.sgos.dto.LoginResponse;
import com.sgos.dto.UsuarioResponse;
import com.sgos.entities.Usuarios;
import com.sgos.repositories.UsuariosRepository;
import com.sgos.security.JwtService;
import com.sgos.services.UsuariosSeriviceManager;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuariosSeriviceManager usuarioService;

    @Autowired
    private UsuariosRepository usuariosRepository;

    @Autowired
    private JwtService jwtService;

    @PostMapping
    public ResponseEntity<?> crearTecnico(
            @Valid @RequestBody CrearUsuarioRequest request) {

        try {
            Usuarios usuario = usuarioService.crearTecnico(request);

            UsuarioResponse respuesta = new UsuarioResponse(
                    usuario.getId(),
                    usuario.getNombre(),
                    usuario.getCorreo(),
                    usuario.getTelefono(),
                    usuario.getRol().getNombre(),
                    usuario.getActivo()
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(respuesta);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        if (request.correo() == null
                || request.contrasena() == null
                || request.correo().isBlank()
                || request.contrasena().isBlank()) {

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

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listarUsuarios() {

        List<UsuarioResponse> usuarios = usuarioService
                .listarUsuarios()
                .stream()
                .map(this::convertirAResponse)
                .toList();

        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarUsuario(@PathVariable Long id) {

        try {
            Usuarios usuario = usuarioService.buscarPorId(id);

            return ResponseEntity.ok(
                    convertirAResponse(usuario)
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("error", e.getMessage())
            );
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambiarEstadoRequest request,
            Authentication authentication) {

        try {

            Usuarios usuario = usuarioService.buscarPorId(id);

            // Impedir que el administrador desactive su propia cuenta
            if (!request.activo()
                    && usuario.getCorreo().equalsIgnoreCase(
                            authentication.getName())) {

                return ResponseEntity.badRequest().body(
                        Map.of(
                                "error",
                                "No puedes desactivar tu propia cuenta"
                        )
                );
            }

            Usuarios actualizado = usuarioService.cambiarEstado(
                    id,
                    request.activo()
            );

            return ResponseEntity.ok(
                    convertirAResponse(actualizado)
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("error", e.getMessage())
            );
        }
    }

    private UsuarioResponse convertirAResponse(Usuarios usuario) {

        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getTelefono(),
                usuario.getRol().getNombre(),
                usuario.getActivo()
        );
    }

}
