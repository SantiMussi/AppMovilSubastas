package com.subastas.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "duenios")
public class Duenio {

    @Id
    private Integer identificador;

    @OneToOne
    @MapsId
    @JoinColumn(name = "identificador")
    private Persona persona;

    @ManyToOne
    @JoinColumn(name = "numeroPais")
    private Pais pais;

    @Column(name = "verificacionFinanciera", length = 2)
    private String verificacionFinanciera;

    @Column(name = "verificacionJudicial", length = 2)
    private String verificacionJudicial;

    private Integer calificacionRiesgo;

    @ManyToOne
    @JoinColumn(name = "verificador", nullable = false)
    private Empleado verificador;
}