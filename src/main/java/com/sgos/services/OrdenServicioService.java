package com.sgos.services;
import java.util.List;

import com.sgos.entities.OrdenServicio;

//Contratos de servicios para la entidad OrdenServicio, 
//(define los métodos que se implementarán en la clase de servicio correspondiente)
public interface OrdenServicioService {
    List<OrdenServicio> findAll();
    OrdenServicio findById(Long id);
    OrdenServicio save(OrdenServicio ordenServicio);
    OrdenServicio update(Long id, OrdenServicio ordenServicio);
    void delete(Long id);
}
