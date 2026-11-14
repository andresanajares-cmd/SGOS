
package com.sgos.dto;

import jakarta.validation.constraints.NotNull;

public record CambiarEstadoOrdenRequest(

    @NotNull(message = "El estado es obligatorio")
    Long estadoId

) {
}
