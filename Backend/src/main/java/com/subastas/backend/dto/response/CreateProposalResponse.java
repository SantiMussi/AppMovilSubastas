package com.subastas.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateProposalResponse {
    private String message;
    private Integer proposalId;
    private String status;
}