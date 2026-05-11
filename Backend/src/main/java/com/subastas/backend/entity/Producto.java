package com.subastas.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    private LocalDate fecha;

    @Column(length = 2)
    private String disponible;

    @Column(length = 500)
    private String descripcionCatalogo;

    @Column(length = 300, nullable = false)
    private String descripcionCompleta;

    @ManyToOne
    @JoinColumn(name = "revisor", nullable = false)
    private Empleado revisor;

    @ManyToOne
    @JoinColumn(name = "duenio", nullable = false)
    private Duenio duenio; 

    @ManyToOne
    @JoinColumn(name = "seguro")
    private Seguro seguro; 
}