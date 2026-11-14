
package com.sgos.dto;

import jakarta.validation.constraints.NotNull;

public record CambiarEstadoRequest(

    @NotNull(message = "El estado es obligatorio")
    Boolean activo

) {
}
