
package com.sgos.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sgos.entities.SeguimientoOrden;

public interface SeguimientoOrdenRepository
        extends JpaRepository<SeguimientoOrden, Long> {

    List<SeguimientoOrden>
        findByOrden_IdOrderByFechaRegistroAscIdAsc(Long ordenId);
}
