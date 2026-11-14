
package com.sgos.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sgos.entities.EstadoOrden;
import com.sgos.repositories.EstadoOrdenRepository;

@RestController
@RequestMapping("/api/estados")
public class EstadoOrdenController {

    private final EstadoOrdenRepository repository;

    public EstadoOrdenController(
            EstadoOrdenRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<EstadoOrden>> listar() {
        return ResponseEntity.ok(repository.findAll());
    }
}
