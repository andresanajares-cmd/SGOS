
package com.sgos.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OrdenServicioRequest(

    @NotBlank(message = "La descripción es obligatoria")
    String descripcion,

    @NotNull(message = "La fecha es obligatoria")
    LocalDate fecha,

    @NotNull(message = "El estado es obligatorio")
    Long estadoId,

    @NotNull(message = "El cliente es obligatorio")
    Long clienteId,

    Long tecnicoId

) {
}
