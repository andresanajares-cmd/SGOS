package com.sgos.controllers;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sgos.dto.CambiarEstadoOrdenRequest;
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
public ResponseEntity<Page<OrdenServicioResponse>> listar(
        @RequestParam(required = false) Long estadoId,
        @RequestParam(required = false) Long clienteId,
        @RequestParam(required = false) Long tecnicoId,
        @RequestParam(required = false) String descripcion,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "fecha") String ordenarPor,
        @RequestParam(defaultValue = "desc") String direccion) {

    if (page < 0 || size < 1 || size > 100) {
        return ResponseEntity.badRequest().build();
    }

    if (!List.of("id", "fecha", "descripcion").contains(ordenarPor)) {
        return ResponseEntity.badRequest().build();
    }

    if (!direccion.equalsIgnoreCase("asc")
            && !direccion.equalsIgnoreCase("desc")) {
        return ResponseEntity.badRequest().build();
    }

    Sort sort = direccion.equalsIgnoreCase("asc")
            ? Sort.by(ordenarPor).ascending()
            : Sort.by(ordenarPor).descending();

    Pageable pageable = PageRequest.of(page, size, sort);

    Page<OrdenServicioResponse> resultado =
            ordenServicioService.filtrarOrdenes(
                    estadoId,
                    clienteId,
                    tecnicoId,
                    descripcion,
                    pageable
            ).map(this::convertirAResponse);

    return ResponseEntity.ok(resultado);
}

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambiarEstadoOrdenRequest request,
            Authentication authentication) {

        try {

            OrdenServicio orden = ordenServicioService.cambiarEstado(
                    id,
                    request.estadoId(),
                    authentication.getName()
            );

            return ResponseEntity.ok(
                    convertirAResponse(orden)
            );

        } catch (NoSuchElementException e) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                convertirAResponse(
                        ordenServicioService.findByIdParaUsuario(
                                id,
                                authentication.getName()
                        )
                )
        );
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

    @GetMapping("/mis-ordenes")
    public ResponseEntity<?> misOrdenes(
            Authentication authentication) {

        try {

            List<OrdenServicioResponse> ordenes
                    = ordenServicioService
                            .findMisOrdenes(authentication.getName())
                            .stream()
                            .map(this::convertirAResponse)
                            .toList();

            return ResponseEntity.ok(ordenes);

        } catch (NoSuchElementException e) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

}
