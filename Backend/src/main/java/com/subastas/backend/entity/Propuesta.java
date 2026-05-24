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

    @Column(nullable = false, length = 20)
    private String estado; // en_revision | aceptada | rechazada | terms_pendientes

    //Campos que completa el admin

    @Column(precision = 15, scale = 2)
    private BigDecimal precioBase;

    @Column(precision = 15, scale = 2)
    private BigDecimal comision;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subastaAsignada")
    private Subasta subastaAsignada;

    @Column(length = 500)
    private String motivoRechazo;

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
