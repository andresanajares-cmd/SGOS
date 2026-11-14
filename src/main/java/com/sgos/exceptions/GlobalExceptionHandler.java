package com.sgos.exceptions;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import com.sgos.dto.ErrorResponse;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> manejarResponseStatusException(
            ResponseStatusException ex,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.resolve(
                ex.getStatusCode().value()
        );

        String error = status != null
                ? status.getReasonPhrase()
                : "Error HTTP";

        ErrorResponse respuesta = new ErrorResponse(
                LocalDateTime.now(),
                ex.getStatusCode().value(),
                error,
                ex.getReason() != null
                ? ex.getReason()
                : "Error al procesar la solicitud",
                request.getRequestURI()
        );

        return ResponseEntity
                .status(ex.getStatusCode())
                .body(respuesta);
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ErrorResponse> manejarNoSuchElementException(
            NoSuchElementException ex,
            HttpServletRequest request) {

        ErrorResponse respuesta = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value(),
                HttpStatus.NOT_FOUND.getReasonPhrase(),
                ex.getMessage() != null
                ? ex.getMessage()
                : "El recurso solicitado no existe",
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(respuesta);
    }
}
