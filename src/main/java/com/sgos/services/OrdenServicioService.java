package com.sgos.services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.sgos.dto.OrdenServicioRequest;
import com.sgos.entities.OrdenServicio;

public interface OrdenServicioService {

    List<OrdenServicio> findAll();

    OrdenServicio findById(Long id);

    OrdenServicio save(OrdenServicioRequest request);

    OrdenServicio update(Long id, OrdenServicioRequest request);

    void deleteById(Long id);

    OrdenServicio cambiarEstado(
            Long id,
            Long estadoId,
            String correoUsuario
    );

    List<OrdenServicio> findMisOrdenes(String correoUsuario);

    OrdenServicio findByIdParaUsuario(Long id, String correoUsuario);

    Page<OrdenServicio> filtrarOrdenes(
            Long estadoId,
            Long clienteId,
            Long tecnicoId,
            String descripcion,
            Pageable pageable
    );
}
