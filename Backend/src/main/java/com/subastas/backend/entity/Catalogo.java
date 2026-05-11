package com.subastas.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "catalogos")
public class Catalogo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @Column(nullable = false, length = 250)
    private String descripcion;

    @ManyToOne
    @JoinColumn(name = "subasta")
    private Subasta subasta;

    @ManyToOne
    @JoinColumn(name = "responsable", nullable = false)
    private Empleado responsable;
}