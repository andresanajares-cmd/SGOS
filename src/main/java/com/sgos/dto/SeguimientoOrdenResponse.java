
package com.sgos.dto;

import java.time.LocalDateTime;

public record SeguimientoOrdenResponse(

    Long id,
    String comentario,
    LocalDateTime fechaRegistro,
    Long ordenId,
    Long usuarioId,
    String usuarioNombre

) {
}
