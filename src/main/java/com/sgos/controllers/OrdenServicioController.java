package com.sgos.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sgos.entities.OrdenServicio;
import com.sgos.services.OrdenServicioServiceManager;


//entrada HTTP, recibe la peticion y la comunica con el serviceManager,
// y este devuelve una respuesta al cliente.


//En las respuestas http, se utiliza ResponseEntity para encapsular la respuesta y el código de estado HTTP correspondiente segun las bases de Api REST.
@RestController
@RequestMapping("/api/ordenesservicios")
public class OrdenServicioController {

    @Autowired
    private OrdenServicioServiceManager serviceManager;

    @GetMapping()
    @Transactional(readOnly = true)

    //Buscar todas las ordenes de servicio
    public ResponseEntity<List<OrdenServicio>> findAll() {
        return ResponseEntity.ok(this.serviceManager.findAll()); //nos regresa un 200 OK con la lista de ordenes de servicio
    }

    @PostMapping
    @Transactional
    //Guardar un nuevo registro de orden de servicio
    public ResponseEntity<OrdenServicio> save(@RequestBody OrdenServicio ordenServicio) {
        OrdenServicio savedOrdenServicio = this.serviceManager.save(ordenServicio);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedOrdenServicio); //nos regresa un 201 Created con la orden de servicio guardada
    }



    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    //Buscar una orden de servicio por su id
    public ResponseEntity<OrdenServicio> getByIdOrdenServicio(@PathVariable Long id) {
        OrdenServicio orden = this.serviceManager.findById(id);
        if (orden == null) {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
        return ResponseEntity.ok(orden); // 200 OK con la orden de servicio encontrada
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> update(@PathVariable Long id,
            @RequestBody OrdenServicio ordenServicio) {
       
        try {
            // El servicio se encarga de buscar, validar, setear y guardar todo en un solo paso
            OrdenServicio ordenActualizada = this.serviceManager.update(id, ordenServicio);

            // Si todo sale bien, devolvemos un 200 OK o 201 Created con el resultado
            return ResponseEntity.status(HttpStatus.CREATED).body(ordenActualizada);
        } catch (RuntimeException e) {
            // Si el servicio lanzó el error porque el ID no existía, lo atrapamos aquí
            // Y le respondemos al cliente con un limpio 404 Not Found
            return ResponseEntity.notFound().build();
        }

    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            this.serviceManager.delete(id);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }

}
