
package com.sgos.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.sgos.entities.OrdenServicio;

public interface OrdenServicioRepository
        extends JpaRepository<OrdenServicio, Long>,
                JpaSpecificationExecutor<OrdenServicio>  {

    List<OrdenServicio> findByTecnico_Id(Long tecnicoId);

}
