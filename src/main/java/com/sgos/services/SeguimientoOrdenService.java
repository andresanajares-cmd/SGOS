
package com.sgos.services;

import java.util.List;

import com.sgos.dto.SeguimientoOrdenRequest;
import com.sgos.dto.SeguimientoOrdenResponse;

public interface SeguimientoOrdenService {

    SeguimientoOrdenResponse crear(
        Long ordenId,
        SeguimientoOrdenRequest request,
        String correoUsuario
    );

    List<SeguimientoOrdenResponse> listarPorOrden(Long ordenId);
}
