
package com.sgos.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sgos.entities.Cliente;

public interface ClienteRepository
        extends JpaRepository<Cliente, Long> {

    boolean existsByCorreo(String correo);
}
