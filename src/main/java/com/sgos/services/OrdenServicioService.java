package com.sgos.services;
import java.util.List;

import com.sgos.entities.OrdenServicio;

public interface OrdenServicioService {
    List<OrdenServicio> findAll();
    OrdenServicio findById(Long id);
    OrdenServicio save(OrdenServicio ordenServicio);
    OrdenServicio update(Long id, OrdenServicio ordenServicio);

}
