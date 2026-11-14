
package com.sgos.dto;

import java.time.LocalDate;

public record OrdenServicioResponse(

    Long id,
    String descripcion,
    LocalDate fecha,

    Long estadoId,
    String estado,

    Long clienteId,
    String cliente,

    Long tecnicoId,
    String tecnico

) {
}
