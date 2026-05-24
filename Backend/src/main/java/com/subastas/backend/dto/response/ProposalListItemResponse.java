package com.subastas.backend.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProposalListItemResponse {
    private Integer proposalId;
    private String titulo;
    private String status;
    private LocalDateTime createdAt;
}