package com.sgos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CambiarRolRequest(
        @NotBlank(message = "El rol es obligatorio")

        @Pattern(
                regexp = "TECNICO|ADMINISTRADOR",
                message = "El rol debe ser TECNICO o ADMINISTRADOR"
        )

        String rol
        ) {

}
