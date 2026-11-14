
package com.sgos.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sgos.entities.EstadoOrden;

public interface EstadoOrdenRepository
        extends JpaRepository<EstadoOrden, Long> {

    Optional<EstadoOrden> findByNombre(String nombre);
}
