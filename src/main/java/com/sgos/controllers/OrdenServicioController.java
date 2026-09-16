package com.sgos.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sgos.entities.OrdenServicio;
import com.sgos.services.OrdenServicioServiceManager;


@RestController
@RequestMapping ("/api/ordenesservicios") 
public class OrdenServicioController {

    @Autowired
    private OrdenServicioServiceManager serviceManager;

    @GetMapping()
    @Transactional(readOnly = true)
    public List<OrdenServicio> findAll() {
        return this.serviceManager.findAll();
    }

    @PostMapping
    @Transactional
    public OrdenServicio save(@RequestBody OrdenServicio ordenServicio) {
        return this.serviceManager.save(ordenServicio);
       
    } 

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public OrdenServicio getByIdOrdenServicio(@PathVariable Long id) {
        return this.serviceManager.findById(id);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> update( @PathVariable Long id, 
        @RequestBody OrdenServicio ordenServicio) {
        Optional<OrdenServicio> orden = Optional.of(this.serviceManager.findById(id));
        
        if(orden.isPresent()){
            OrdenServicio updatedOrden = orden.get();
            // Perform update logic here
            updatedOrden.setDescripcion(ordenServicio.getDescripcion());
            updatedOrden.setFecha(ordenServicio.getFecha());
            updatedOrden.setEstado(ordenServicio.getEstado());
            updatedOrden.setCliente(ordenServicio.getCliente());
            updatedOrden.setResponsable(ordenServicio.getResponsable());

            this.serviceManager.update(id, updatedOrden);
            return ResponseEntity.status(HttpStatus.CREATED).body(this.serviceManager.update(id, updatedOrden));
        }
        return ResponseEntity.notFound().build();
    }
}
