package com.subastas.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "clientes")
public class Cliente {

    @Id
    private Integer identificador;

    @OneToOne
    @MapsId
    @JoinColumn(name = "identificador")
    private Persona persona;

    @ManyToOne
    @JoinColumn(name = "numeroPais")
    private Pais pais;

    @Column(length = 2)
    private String admitido; // Podría ser un Boolean en el futuro

    @Column(length = 10)
    private String categoria; // 'comun', 'especial', 'plata', etc.

    @ManyToOne
    @JoinColumn(name = "verificador", nullable = false)
    private Empleado verificador;
}