package com.subastas.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProposalTermsRequest {
    @NotNull
    private Boolean acceptBasePriceAndCommission;
}