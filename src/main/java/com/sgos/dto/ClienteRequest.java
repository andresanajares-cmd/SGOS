
package com.sgos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClienteRequest(

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 120)
    String nombre,

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no es válido")
    String correo,

    @Size(max = 20)
    String telefono,

    @Size(max = 200)
    String direccion

) {
}
