package com.subastas.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "subastadores")
public class Subastador {

    @Id
    private Integer identificador;

    @OneToOne
    @MapsId
    @JoinColumn(name = "identificador")
    private Persona persona;

    @Column(length = 15)
    private String matricula;

    @Column(length = 50)
    private String region;
}