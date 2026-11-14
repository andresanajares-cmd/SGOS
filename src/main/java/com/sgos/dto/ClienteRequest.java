
package com.sgos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClienteRequest(

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 120, message = "El nombre no puede superar los 120 caracteres")
    String nombre,

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no es válido")
    @Size(max = 120, message = "El correo no puede superar los 120 caracteres")
    String correo,

    @Size(max = 20, message = "El teléfono no puede superar los 20 caracteres")
    String telefono,

    @Size(max = 200, message = "La dirección no puede superar los 200 caracteres")
    String direccion

) {
}
