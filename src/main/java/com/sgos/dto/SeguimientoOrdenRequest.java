
package com.sgos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SeguimientoOrdenRequest(

    @NotBlank(message = "El comentario es obligatorio")
    @Size(max = 1000, message = "El comentario es demasiado largo")
    String comentario

) {
}
