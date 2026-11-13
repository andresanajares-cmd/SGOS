
package com.sgos.dto;

public record LoginResponse(
    String token,
    String tipo,
    Long id,
    String nombre,
    String correo,
    String rol
) {
}
