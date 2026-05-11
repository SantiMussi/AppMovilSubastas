package com.subastas.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "subastas")
public class Subasta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false)
    private LocalTime hora;

    @Column(length = 10)
    private String estado; 

    @ManyToOne
    @JoinColumn(name = "subastador")
    private Subastador subastador; 

    @Column(length = 350)
    private String ubicacion;

    private Integer capacidadAsistentes;

    @Column(length = 2)
    private String tieneDeposito;

    @Column(length = 2)
    private String seguridadPropia;

    @Column(length = 10)
    private String categoria;
}