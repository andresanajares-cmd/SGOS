package com.sgos.controllers;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sgos.dto.OrdenServicioRequest;
import com.sgos.dto.OrdenServicioResponse;
import com.sgos.entities.OrdenServicio;
import com.sgos.entities.Usuarios;
import com.sgos.services.OrdenServicioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ordenesservicios")
public class OrdenServicioController {

    private final OrdenServicioService ordenServicioService;

    public OrdenServicioController(
            OrdenServicioService ordenServicioService) {

        this.ordenServicioService = ordenServicioService;
    }

    @GetMapping
    public ResponseEntity<List<OrdenServicioResponse>> listar() {

        List<OrdenServicioResponse> ordenes = ordenServicioService
                .findAll()
                .stream()
                .map(this::convertirAResponse)
                .toList();

        return ResponseEntity.ok(ordenes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {

        try {
            return ResponseEntity.ok(
                    convertirAResponse(ordenServicioService.findById(id))
            );

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> crear(
            @Valid @RequestBody OrdenServicioRequest request) {

        try {
            OrdenServicio orden = ordenServicioService.save(request);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(convertirAResponse(orden));

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "No se pudo guardar la orden"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody OrdenServicioRequest request) {

        try {
            return ResponseEntity.ok(
                    convertirAResponse(
                            ordenServicioService.update(id, request)
                    )
            );

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "No se pudo actualizar la orden"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {

        try {
            ordenServicioService.deleteById(id);

            return ResponseEntity.noContent().build();

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "error",
                            "No se puede eliminar la orden porque tiene registros relacionados"
                    ));
        }
    }

    private OrdenServicioResponse convertirAResponse(
            OrdenServicio orden) {

        Usuarios tecnico = orden.getTecnico();

        return new OrdenServicioResponse(
                orden.getId(),
                orden.getDescripcion(),
                orden.getFecha(),
                orden.getEstado().getId(),
                orden.getEstado().getNombre(),
                orden.getCliente().getId(),
                orden.getCliente().getNombre(),
                tecnico != null ? tecnico.getId() : null,
                tecnico != null ? tecnico.getNombre() : null
        );
    }

}
