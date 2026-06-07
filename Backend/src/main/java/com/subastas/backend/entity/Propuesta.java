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

    @Column(nullable = false)
    private Boolean declaracionPropiedad;

    @Column(nullable = false)
    private Boolean acuerdoEnvio;

    @Column(length = 500)
    private String origenLicitoUrl;

    @Column(nullable = false, length = 30)
    private String estado;

    // ── Campos que completa el admin ──────────────────────────────────

    @Column(precision = 15, scale = 2)
    private BigDecimal precioBase;

    @Column(precision = 15, scale = 2)
    private BigDecimal comision;

    /** Moneda propuesta por el admin al aprobar (ARS | USD). */
    @Column(length = 3)
    private String moneda;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subastaAsignada")
    private Subasta subastaAsignada;

    /**
     * Feedback del admin (antes motivoRechazo).
     * Se mapea a la columna existente para no alterar la tabla.
     * Se usa tanto en rechazos como en revisiones con notas.
     */
    @Column(length = 1000)
    private String feedback;

    /**
     * Decisión del usuario sobre los términos propuestos por el admin.
     * null  → la empresa rechazó el artículo (el usuario nunca respondió)
     * false → el usuario rechazó el precio propuesto
     * true  → el usuario aceptó el precio propuesto
     */
    @Column
    private Boolean aceptadoPorUsuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "revisor")
    private Empleado revisor;

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