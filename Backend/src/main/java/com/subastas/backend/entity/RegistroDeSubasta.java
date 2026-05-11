package com.subastas.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "registroDeSubasta")
public class RegistroDeSubasta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @ManyToOne
    @JoinColumn(name = "subasta", nullable = false)
    private Subasta subasta;

    @ManyToOne
    @JoinColumn(name = "duenio", nullable = false)
    private Duenio duenio;

    @ManyToOne
    @JoinColumn(name = "producto", nullable = false)
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "cliente", nullable = false)
    private Cliente cliente;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal importe;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal comision;
}