package com.subastas.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "multas")
public class Multa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUsuario", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "idSubasta", nullable = false)
    private Subasta subasta;

    @ManyToOne
    @JoinColumn(name = "idPuja", nullable = false)
    private Pujo pujo;

    @Column(nullable = false, length = 50)
    private String estado; // pendiente, paga, vencida

    @Column(nullable = false, length = 10)
    private String moneda;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal montoOferta;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal montoMulta;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal porcentajeMulta;

    @Column(nullable = false)
    private LocalDateTime fechaEmision;

    @Column(nullable = false)
    private LocalDateTime fechaLimite;

    private LocalDateTime fechaPago;

    @PrePersist
    public void prePersist() {
        if (fechaEmision == null) {
            fechaEmision = LocalDateTime.now();
        }

        if (porcentajeMulta == null) {
            porcentajeMulta = BigDecimal.valueOf(10.00);
        }

        if (estado == null) {
            estado = "pendiente";
        }
    }
}