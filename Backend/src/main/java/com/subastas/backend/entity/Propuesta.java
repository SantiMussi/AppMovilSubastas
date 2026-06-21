package com.subastas.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "propuestas")
public class Propuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente", nullable = false)
    private Cliente cliente;

    @Column(nullable = false, length = 250)
    private String titulo;

    @Column(nullable = false, length = 500)
    private String descripcion;

    @Column(nullable = false, length = 1000)
    private String historia;

    @Column(length = 500)
    private String origenLicitoUrl;

    @Column(nullable = false, length = 30)
    private String estado;


    @Column(precision = 15, scale = 2)
    private BigDecimal precioBase;

    @Column(precision = 15, scale = 2)
    private BigDecimal comision;

    @Column(length = 3)
    private String moneda;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subastaAsignada")
    private Subasta subastaAsignada;

    @Column(length = 1000)
    private String feedback;

    @Column
    private Boolean aceptadoPorUsuario;

    @Column(length = 20)
    private String tipoDevolucion;

    @Column(length = 500)
    private String direccionDevolucion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "revisor")
    private Empleado revisor;

    /**
    * Producto generado automáticamente cuando el usuario acepta los términos.
    * null hasta que el usuario acepte.
    */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "productoGenerado")
    private Producto productoGenerado;

    @OneToMany(mappedBy = "propuesta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FotoPropuesta> fotos = new ArrayList<>();

    @Column
    private LocalDateTime fechaEvaluacion;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    public void prePersist() {
        if (fechaCreacion == null) fechaCreacion = LocalDateTime.now();
        if (estado == null) estado = "en_revision";
    }
}