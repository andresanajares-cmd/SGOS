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
import com.sgos.entities.Usuarios;
import com.sgos.repositories.ClienteRepository;
import com.sgos.repositories.EstadoOrdenRepository;
import com.sgos.repositories.OrdenServicioRepository;
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
            UsuariosRepository usuariosRepository) {

        this.ordenRepository = ordenRepository;
        this.clienteRepository = clienteRepository;
        this.estadoRepository = estadoRepository;
        this.usuariosRepository = usuariosRepository;
    }

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

        Cliente cliente = buscarCliente(request.clienteId());

        asignarDatos(orden, request, cliente);

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

}
