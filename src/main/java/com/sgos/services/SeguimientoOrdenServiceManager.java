
package com.sgos.services;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sgos.dto.SeguimientoOrdenRequest;
import com.sgos.dto.SeguimientoOrdenResponse;
import com.sgos.entities.OrdenServicio;
import com.sgos.entities.SeguimientoOrden;
import com.sgos.entities.Usuarios;
import com.sgos.repositories.OrdenServicioRepository;
import com.sgos.repositories.SeguimientoOrdenRepository;
import com.sgos.repositories.UsuariosRepository;

@Service
public class SeguimientoOrdenServiceManager
        implements SeguimientoOrdenService {

    private final SeguimientoOrdenRepository seguimientoRepository;
    private final OrdenServicioRepository ordenRepository;
    private final UsuariosRepository usuariosRepository;

    public SeguimientoOrdenServiceManager(
            SeguimientoOrdenRepository seguimientoRepository,
            OrdenServicioRepository ordenRepository,
            UsuariosRepository usuariosRepository) {

        this.seguimientoRepository = seguimientoRepository;
        this.ordenRepository = ordenRepository;
        this.usuariosRepository = usuariosRepository;
    }

    @Override
    @Transactional
    public SeguimientoOrdenResponse crear(
            Long ordenId,
            SeguimientoOrdenRequest request,
            String correoUsuario) {

        OrdenServicio orden = ordenRepository.findById(ordenId)
            .orElseThrow(() -> new NoSuchElementException(
                "No existe una orden con ID: " + ordenId
            ));

        Usuarios usuario = usuariosRepository.findByCorreo(correoUsuario)
            .orElseThrow(() -> new NoSuchElementException(
                "No existe el usuario autenticado"
            ));

        SeguimientoOrden seguimiento = new SeguimientoOrden();

        seguimiento.setComentario(request.comentario().trim());
        seguimiento.setOrden(orden);
        seguimiento.setUsuario(usuario);

        SeguimientoOrden guardado =
            seguimientoRepository.saveAndFlush(seguimiento);

        return convertirAResponse(guardado);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeguimientoOrdenResponse> listarPorOrden(Long ordenId) {

        if (!ordenRepository.existsById(ordenId)) {
            throw new NoSuchElementException(
                "No existe una orden con ID: " + ordenId
            );
        }

        return seguimientoRepository
            .findByOrden_IdOrderByFechaRegistroAscIdAsc(ordenId)
            .stream()
            .map(this::convertirAResponse)
            .toList();
    }

    private SeguimientoOrdenResponse convertirAResponse(
            SeguimientoOrden seguimiento) {

        return new SeguimientoOrdenResponse(
            seguimiento.getId(),
            seguimiento.getComentario(),
            seguimiento.getFechaRegistro(),
            seguimiento.getOrden().getId(),
            seguimiento.getUsuario().getId(),
            seguimiento.getUsuario().getNombre()
        );
    }
}
