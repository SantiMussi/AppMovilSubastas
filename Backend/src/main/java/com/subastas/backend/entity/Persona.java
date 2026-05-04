package com.subastas.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "personas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Persona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "documento", nullable = false, length = 20)
    private String documento;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    // Campos agregados para cumplir con el CSV (Endpoints 2.0)
    @Column(name = "apellido", length = 150)
    private String apellido;

    @Column(name = "email", unique = true, length = 150)
    private String email;

    @Column(name = "password", length = 255)
    private String password;

    @Column(name = "direccion", length = 250)
    private String direccion;

    @Column(name = "estado", length = 15)
    private String estado; // 'activo', 'incativo' (según SQL original)

    @Lob
    @Column(name = "foto")
    private byte[] foto;

    @Lob
    @Column(name = "fotoDniFrente")
    private byte[] fotoDniFrente;

    @Lob
    @Column(name = "fotoDniDorso")
    private byte[] fotoDniDorso;
}
