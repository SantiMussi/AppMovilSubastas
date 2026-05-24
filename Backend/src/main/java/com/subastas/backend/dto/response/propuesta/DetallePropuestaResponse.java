package com.subastas.backend.dto.response.propuesta;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DetallePropuestaResponse {
    private Integer proposalId;
    private String titulo;
    private String descripcion;
    private String historia;
    private String status;
    private String rejectionReason;
    private AssignedAuctionResponse assignedAuction;
    private BigDecimal basePrice;
    private BigDecimal commission;

    @Data
    public static class AssignedAuctionResponse {
        private Integer auctionId;
        private String fecha;
        private String hora;
    }
}