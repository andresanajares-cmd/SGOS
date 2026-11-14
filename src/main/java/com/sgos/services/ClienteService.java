
package com.sgos.services;

import java.util.List;

import com.sgos.dto.ClienteRequest;
import com.sgos.entities.Cliente;

public interface ClienteService {

    List<Cliente> listarClientes();

    Cliente buscarPorId(Long id);

    Cliente crearCliente(ClienteRequest request);

    Cliente actualizarCliente(Long id, ClienteRequest request);

    void eliminarCliente(Long id);
}
