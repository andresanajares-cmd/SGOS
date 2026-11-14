package com.sgos.services;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sgos.dto.OrdenServicioRequest;
import com.sgos.entities.Cliente;
import com.sgos.entities.EstadoOrden;
import com.sgos.entities.OrdenServicio;
import com.sgos.entities.SeguimientoOrden;
import com.sgos.entities.Usuarios;
import com.sgos.repositories.ClienteRepository;
import com.sgos.repositories.EstadoOrdenRepository;
import com.sgos.repositories.OrdenServicioRepository;
import com.sgos.repositories.SeguimientoOrdenRepository;
import com.sgos.repositories.UsuariosRepository;

@Service
public class OrdenServicioServiceManager
        implements OrdenServicioService {

    private final OrdenServicioRepository ordenRepository;
    private final ClienteRepository clienteRepository;

    public OrdenServicioServiceManager(
            OrdenServicioRepository ordenRepository,
            ClienteRepository clienteRepository,
            EstadoOrdenRepository estadoRepository,
            UsuariosRepository usuariosRepository,
            SeguimientoOrdenRepository seguimientoRepository) {

        this.ordenRepository = ordenRepository;
        this.clienteRepository = clienteRepository;
        this.estadoRepository = estadoRepository;
        this.usuariosRepository = usuariosRepository;
        this.seguimientoRepository = seguimientoRepository;
    }

    private final SeguimientoOrdenRepository seguimientoRepository;
    private final UsuariosRepository usuariosRepository;
    private final EstadoOrdenRepository estadoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OrdenServicio> findAll() {

        List<OrdenServicio> ordenes = new ArrayList<>();

        ordenRepository.findAll().forEach(ordenes::add);

        return ordenes;
    }

    @Override
    @Transactional(readOnly = true)
    public OrdenServicio findById(Long id) {
        return ordenRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(
                        "No existe una orden con ID: " + id
                ));
    }

    @Override
    @Transactional
    public OrdenServicio save(OrdenServicioRequest request) {

        Cliente cliente = buscarCliente(request.clienteId());
        EstadoOrden estadoInicial = buscarEstado(request.estadoId());

        if (!"ABIERTA".equals(estadoInicial.getNombre())) {
            throw new IllegalArgumentException(
                    "Las órdenes nuevas deben iniciar en estado ABIERTA"
            );
        }
        OrdenServicio orden = new OrdenServicio();

        asignarDatos(orden, request, cliente);

        return ordenRepository.save(orden);
    }

    private EstadoOrden buscarEstado(Long estadoId) {

        return estadoRepository.findById(estadoId)
                .orElseThrow(() -> new NoSuchElementException(
                        "No existe un estado con ID: " + estadoId
                ));
    }

    @Override
    @Transactional
    public OrdenServicio update(
            Long id,
            OrdenServicioRequest request) {

        OrdenServicio orden = findById(id);

        if (!orden.getEstado().getId().equals(request.estadoId())) {
            throw new IllegalArgumentException(
                    "Para cambiar el estado utiliza el endpoint de cambio de estado"
            );
        }

        if ("CERRADA".equals(orden.getEstado().getNombre())) {
            throw new IllegalArgumentException(
                    "No se puede modificar una orden cerrada"
            );
        }

        Cliente cliente = buscarCliente(request.clienteId());

        asignarDatos(orden, request, cliente);

        return ordenRepository.save(orden);
    }

    @Override
    @Transactional
    public OrdenServicio cambiarEstado(
            Long id,
            Long estadoId,
            String correoUsuario) {

        OrdenServicio orden = findById(id);
        validarAccesoOrden(orden, correoUsuario);

        EstadoOrden nuevoEstado = buscarEstado(estadoId);

        String actual = orden.getEstado().getNombre();
        String siguiente = nuevoEstado.getNombre();

        boolean permitido
                = (actual.equals("ABIERTA")
                && siguiente.equals("EN_PROCESO"))
                || (actual.equals("EN_PROCESO")
                && siguiente.equals("CERRADA"));

        if (!permitido) {
            throw new IllegalArgumentException(
                    "No se permite cambiar de " + actual
                    + " a " + siguiente
            );
        }

        Usuarios usuario = usuariosRepository
                .findByCorreo(correoUsuario)
                .orElseThrow(() -> new NoSuchElementException(
                        "No existe el usuario autenticado"
                ));

        orden.setEstado(nuevoEstado);

        SeguimientoOrden seguimiento = new SeguimientoOrden();

        seguimiento.setOrden(orden);
        seguimiento.setUsuario(usuario);
        seguimiento.setComentario(
                "Cambio de estado: " + actual + " → " + siguiente
        );

        seguimientoRepository.save(seguimiento);

        return ordenRepository.save(orden);
    }

    private Usuarios buscarTecnico(Long tecnicoId) {

        if (tecnicoId == null) {
            return null;
        }

        Usuarios tecnico = usuariosRepository.findById(tecnicoId)
                .orElseThrow(() -> new NoSuchElementException(
                        "No existe un usuario con ID: " + tecnicoId
                ));

        if (!"TECNICO".equals(tecnico.getRol().getNombre())) {
            throw new IllegalArgumentException(
                    "El usuario seleccionado no tiene el rol TECNICO"
            );
        }

        if (!Boolean.TRUE.equals(tecnico.getActivo())) {
            throw new IllegalArgumentException(
                    "No se pueden asignar órdenes a técnicos inactivos"
            );
        }

        return tecnico;
    }

    @Override
    @Transactional
    public void deleteById(Long id) {

        OrdenServicio orden = findById(id);

        ordenRepository.delete(orden);
    }

    private Cliente buscarCliente(Long clienteId) {

        return clienteRepository.findById(clienteId)
                .orElseThrow(() -> new NoSuchElementException(
                        "No existe un cliente con ID: " + clienteId
                ));
    }

    private void asignarDatos(
            OrdenServicio orden,
            OrdenServicioRequest request,
            Cliente cliente) {

        EstadoOrden estado = buscarEstado(request.estadoId());
        Usuarios tecnico = buscarTecnico(request.tecnicoId());

        orden.setDescripcion(request.descripcion().trim());
        orden.setFecha(request.fecha());
        orden.setEstado(estado);
        orden.setCliente(cliente);
        orden.setTecnico(tecnico);
    }

    public void validarAccesoOrden(
            OrdenServicio orden,
            String correoUsuario) {

        Usuarios usuario = usuariosRepository
                .findByCorreo(correoUsuario)
                .orElseThrow(() -> new NoSuchElementException(
                        "No existe el usuario autenticado"
                ));

        String rol = usuario.getRol().getNombre();

        if ("ADMINISTRADOR".equals(rol)) {
            return;
        }

        if (!"TECNICO".equals(rol)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "No tienes permisos para acceder a esta orden"
            );
        }

        if (orden.getTecnico() == null
                || !orden.getTecnico().getId().equals(usuario.getId())) {

            throw new org.springframework.security.access.AccessDeniedException(
                    "Esta orden no está asignada a tu usuario"
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrdenServicio> findMisOrdenes(String correoUsuario) {

        Usuarios usuario = usuariosRepository
                .findByCorreo(correoUsuario)
                .orElseThrow(() -> new NoSuchElementException(
                        "No existe el usuario autenticado"
                ));

        return ordenRepository.findByTecnico_Id(usuario.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public OrdenServicio findByIdParaUsuario(
            Long id,
            String correoUsuario) {

        OrdenServicio orden = findById(id);

        validarAccesoOrden(orden, correoUsuario);

        return orden;
    }

}
