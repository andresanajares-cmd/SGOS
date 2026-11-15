package com.sgos.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotNull;

public record CambiarEstadoOrdenRequest(
        @NotNull(message = "El estado es obligatorio")
        @Positive(message = "El ID del estado debe ser mayor que cero")
        Long estadoId
        ) {

}
