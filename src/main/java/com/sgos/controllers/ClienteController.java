
package com.sgos.controllers;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sgos.dto.ClienteRequest;
import com.sgos.entities.Cliente;
import com.sgos.services.ClienteService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/clientes")
@Validated
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public ResponseEntity<List<Cliente>> listarClientes() {
        return ResponseEntity.ok(
            clienteService.listarClientes()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {

        try {
            return ResponseEntity.ok(
                clienteService.buscarPorId(id)
            );

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> crearCliente(
            @Valid @RequestBody ClienteRequest request) {

        try {
            Cliente cliente = clienteService.crearCliente(request);

            return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(cliente);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "Conflicto con los datos del cliente"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarCliente(
            @PathVariable Long id,
            @Valid @RequestBody ClienteRequest request) {

        try {
            return ResponseEntity.ok(
                clienteService.actualizarCliente(id, request)
            );

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "Conflicto con los datos del cliente"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCliente(@PathVariable Long id) {

        try {
            clienteService.eliminarCliente(id);

            return ResponseEntity.noContent().build();

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of(
                    "error",
                    "No se puede eliminar el cliente porque tiene registros relacionados"
                ));
        }
    }
}
