
package com.sgos.controllers;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sgos.dto.SeguimientoOrdenRequest;
import com.sgos.dto.SeguimientoOrdenResponse;
import com.sgos.services.SeguimientoOrdenService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ordenesservicios/{ordenId}/seguimientos")
public class SeguimientoOrdenController {

    private final SeguimientoOrdenService seguimientoService;

    public SeguimientoOrdenController(
            SeguimientoOrdenService seguimientoService) {
        this.seguimientoService = seguimientoService;
    }

    @PostMapping
    public ResponseEntity<?> crear(
            @PathVariable Long ordenId,
            @Valid @RequestBody SeguimientoOrdenRequest request,
            Authentication authentication) {

        try {
            SeguimientoOrdenResponse seguimiento =
                seguimientoService.crear(
                    ordenId,
                    request,
                    authentication.getName()
                );

            return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(seguimiento);

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> listar(@PathVariable Long ordenId) {

        try {
            List<SeguimientoOrdenResponse> seguimientos =
                seguimientoService.listarPorOrden(ordenId);

            return ResponseEntity.ok(seguimientos);

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        }
    }
}
