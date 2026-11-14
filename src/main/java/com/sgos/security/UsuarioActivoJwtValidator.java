
package com.sgos.security;

import java.util.Optional;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import com.sgos.entities.Usuarios;
import com.sgos.repositories.UsuariosRepository;

@Component
public class UsuarioActivoJwtValidator
        implements OAuth2TokenValidator<Jwt> {

    private final UsuariosRepository usuariosRepository;

    public UsuarioActivoJwtValidator(
            UsuariosRepository usuariosRepository) {

        this.usuariosRepository = usuariosRepository;
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {

        String correo = jwt.getSubject();

        if (correo == null || correo.isBlank()) {
            return rechazar();
        }

        Optional<Usuarios> usuario =
            usuariosRepository.findByCorreo(correo);

        if (usuario.isEmpty()
                || !Boolean.TRUE.equals(usuario.get().getActivo())) {

            return rechazar();
        }

        // Evita que un JWT con un rol antiguo siga otorgando permisos
        String rolToken = jwt.getClaimAsString("rol");
        String rolActual = usuario.get().getRol().getNombre();

        if (!rolActual.equals(rolToken)) {
            return rechazar();
        }

        // Comprueba que el token corresponde al usuario correcto
        Long idToken = jwt.getClaim("usuarioId") instanceof Number numero
                ? numero.longValue()
                : null;

        if (!usuario.get().getId().equals(idToken)) {
            return rechazar();
        }

        return OAuth2TokenValidatorResult.success();
    }

    private OAuth2TokenValidatorResult rechazar() {

        OAuth2Error error = new OAuth2Error(
            "invalid_token",
            "El usuario no está autorizado o su cuenta está inactiva",
            null
        );

        return OAuth2TokenValidatorResult.failure(error);
    }
}
