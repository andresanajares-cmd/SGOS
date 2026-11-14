
package com.sgos.services;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sgos.dto.ClienteRequest;
import com.sgos.entities.Cliente;
import com.sgos.repositories.ClienteRepository;

@Service
public class ClienteServiceManager implements ClienteService {

    private final ClienteRepository repository;

    public ClienteServiceManager(ClienteRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Cliente> listarClientes() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Cliente buscarPorId(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new NoSuchElementException(
                "No existe un cliente con ID: " + id
            ));
    }

    @Override
    @Transactional
    public Cliente crearCliente(ClienteRequest request) {

        String correo = request.correo().trim().toLowerCase();

        if (repository.existsByCorreo(correo)) {
            throw new IllegalArgumentException(
                "Ya existe un cliente con ese correo"
            );
        }

        Cliente cliente = new Cliente();

        cliente.setNombre(request.nombre().trim());
        cliente.setCorreo(correo);
        cliente.setTelefono(request.telefono());
        cliente.setDireccion(request.direccion());

        return repository.save(cliente);
    }

    @Override
    @Transactional
    public Cliente actualizarCliente(
            Long id,
            ClienteRequest request) {

        Cliente cliente = buscarPorId(id);

        String correo = request.correo().trim().toLowerCase();

        // Evitar correos duplicados al actualizar
        if (!cliente.getCorreo().equals(correo)
                && repository.existsByCorreo(correo)) {

            throw new IllegalArgumentException(
                "Ya existe otro cliente con ese correo"
            );
        }

        cliente.setNombre(request.nombre().trim());
        cliente.setCorreo(correo);
        cliente.setTelefono(request.telefono());
        cliente.setDireccion(request.direccion());

        return repository.save(cliente);
    }

    @Override
    @Transactional
    public void eliminarCliente(Long id) {

        Cliente cliente = buscarPorId(id);

        repository.delete(cliente);
    }
}
