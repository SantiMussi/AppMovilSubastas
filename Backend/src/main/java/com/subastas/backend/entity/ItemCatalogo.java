package com.subastas.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "itemsCatalogo")
public class ItemCatalogo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @ManyToOne
    @JoinColumn(name = "catalogo", nullable = false)
    private Catalogo catalogo;

    @ManyToOne
    @JoinColumn(name = "producto", nullable = false)
    private Producto producto;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal precioBase;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal comision;

    @Column(length = 2)
    private String subastado;
}