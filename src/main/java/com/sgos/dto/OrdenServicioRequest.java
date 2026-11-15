package com.sgos.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Positive;

public record OrdenServicioRequest(
        @NotBlank(message = "La descripción es obligatoria")
        @Size(max = 255, message = "La descripción no puede superar los 255 caracteres")
        String descripcion,
        @NotNull(message = "La fecha es obligatoria")
        LocalDate fecha,
        @NotNull(message = "El estado es obligatorio")
        @Positive(message = "El ID del estado debe ser mayor que cero")
        Long estadoId,
        @NotNull(message = "El cliente es obligatorio")
        @Positive(message = "El ID del cliente debe ser mayor que cero")
        Long clienteId,
        @Positive(message = "El ID del técnico debe ser mayor que cero")
        Long tecnicoId
        ) {

}
