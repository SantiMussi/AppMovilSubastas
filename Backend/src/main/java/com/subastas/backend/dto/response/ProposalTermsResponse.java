package com.subastas.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProposalTermsResponse {
    private String message;
    private String status;
}