package com.subastas.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "monedaProducto")
public class MonedaProducto {

    @Id
    @Column(name = "monedaProductoId")
    private Integer monedaProductoId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "producto")
    private Producto producto;

    /** ISO 4217: ARS, USD, etc. */
    @Column(nullable = false, length = 3)
    private String moneda;
}