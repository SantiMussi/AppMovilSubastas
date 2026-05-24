package com.subastas.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdjudicarItemRequest {

    @NotBlank(message = "adjudicarA es obligatorio (ganador|empresa)")
    private String adjudicarA;
}
