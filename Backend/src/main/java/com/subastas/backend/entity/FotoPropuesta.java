package com.subastas.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "fotosPropuesta")
public class FotoPropuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idFotoPropuesta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "propuesta", nullable = false)
    private Propuesta propuesta;

    @Lob
    @Column(name = "foto", nullable = false, columnDefinition = "LONGBLOB")
    private byte[] foto;
}
