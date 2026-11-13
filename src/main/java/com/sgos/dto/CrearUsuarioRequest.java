
package com.sgos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CrearUsuarioRequest(

    @NotBlank(message = "El nombre es obligatorio")
    String nombre,

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no es válido")
    String correo,

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    String contrasena,

    String telefono

) {
}
