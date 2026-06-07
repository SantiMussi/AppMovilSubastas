package com.subastas.backend.dto.response.puja;

import com.subastas.backend.dto.response.subasta.DetalleItemSubastaResponse;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class PujasEnVivoSnapshotResponse {
    private String type;
    private Instant generatedAt;
    private DetalleItemSubastaResponse detail;
    private TopPujaResponse topBid;
    private HistorialPujaResponse history;
}