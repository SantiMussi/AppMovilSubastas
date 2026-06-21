package com.subastas.backend.dto.request;

import com.subastas.backend.entity.Categoria;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CambiarCategoriaRequest {

    @NotNull(message = "La nueva categoría es obligatoria")
    private Categoria nuevaCategoria;
}
