package com.sgos.controllers;

import java.util.List;

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

        return ResponseEntity.ok(
                clienteService.buscarPorId(id)
        );
    }

    @PostMapping
    public ResponseEntity<?> crearCliente(
            @Valid @RequestBody ClienteRequest request) {

        Cliente cliente = clienteService.crearCliente(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(cliente);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarCliente(
            @PathVariable Long id,
            @Valid @RequestBody ClienteRequest request) {

        return ResponseEntity.ok(
                clienteService.actualizarCliente(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCliente(@PathVariable Long id) {

        clienteService.eliminarCliente(id);

        return ResponseEntity.noContent().build();
    }

}
