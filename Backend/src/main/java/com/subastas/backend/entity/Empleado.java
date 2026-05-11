package com.subastas.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "empleados")
public class Empleado {

    @Id
    private Integer identificador;

    @OneToOne
    @MapsId // Le dice a JPA que la PK de Empleado es también la FK hacia Persona
    @JoinColumn(name = "identificador")
    private Persona persona;

    @Column(length = 100)
    private String cargo;

    @ManyToOne
    @JoinColumn(name = "sector")
    private Sector sector; 
}