package com.sgos.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sgos.entities.OrdenServicio;
import com.sgos.repositories.OrdenServicioRepository;


@Service //Decorador de spring para guardar la logica de la aplicacion. 
// en este caso la logica de negocio de la entidad OrdenServicio
public class OrdenServicioServiceManager implements OrdenServicioService {
    

    @Autowired 
    private OrdenServicioRepository repository; //Inyeccion de dependencias para acceder a los metodos del repositorio de la entidad OrdenServicio. 


    @Override 
    public List<OrdenServicio> findAll() {
        return (List<OrdenServicio>) this.repository.findAll();
    }

    @Override
    public OrdenServicio findById(Long id) {
        return this.repository.findById(id).get();
    }

    @Override
    public OrdenServicio save(OrdenServicio ordenServicio) {
        return this.repository.save(ordenServicio);
    }

    @Override
    public OrdenServicio update(Long id, OrdenServicio ordenServicio) {
        OrdenServicio orden = this.repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden de servicio no encontrada con id: " + id));

        orden.setCliente(ordenServicio.getCliente());
        orden.setDescripcion(ordenServicio.getDescripcion());
        orden.setFecha(ordenServicio.getFecha());
        orden.setEstado(ordenServicio.getEstado());
        orden.setResponsable(ordenServicio.getResponsable());

        return this.repository.save(orden);
    }

    @Override
    public void delete(Long id) {
        OrdenServicio orden = this.repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden de servicio no encontrada con id: " + id));
        this.repository.delete(orden);
    }


    
}
