package com.subastas.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "paises")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pais {

    @Id
    @Column(name = "numero")
    private Integer numero;

    @Column(name = "nombre", nullable = false, length = 250)
    private String nombre;

    @Column(name = "nombreCorto", length = 250)
    private String nombreCorto;

    @Column(name = "capital", nullable = false, length = 250)
    private String capital;

    @Column(name = "nacionalidad", nullable = false, length = 250)
    private String nacionalidad;

    @Column(name = "idiomas", nullable = false, length = 150)
    private String idiomas;
}
