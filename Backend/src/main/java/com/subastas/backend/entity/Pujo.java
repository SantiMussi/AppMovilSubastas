package com.subastas.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "pujos")
public class Pujo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @ManyToOne
    @JoinColumn(name = "asistente", nullable = false)
    private Asistente asistente;

    @ManyToOne
    @JoinColumn(name = "item", nullable = false)
    private ItemCatalogo item;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal importe;

    @Column(length = 2)
    private String ganador;
}