
package com.sgos.security;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.sgos.entities.Usuarios;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final long expiration;

    public JwtService(
            JwtEncoder jwtEncoder,
            @Value("${jwt.expiration}") long expiration) {

        this.jwtEncoder = jwtEncoder;
        this.expiration = expiration;
    }

    public String generarToken(Usuarios usuario) {

        Instant ahora = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("sgos")
                .subject(usuario.getCorreo())
                .issuedAt(ahora)
                .expiresAt(
                    ahora.plus(expiration, ChronoUnit.SECONDS)
                )
                .claim("rol", usuario.getRol().getNombre())
                .claim("usuarioId", usuario.getId())
                .build();

        JwsHeader header = JwsHeader
                .with(MacAlgorithm.HS256)
                .build();

        return jwtEncoder.encode(
                JwtEncoderParameters.from(header, claims)
        ).getTokenValue();
    }
}
