package com.subastas.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "documentacion_persona")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentacionPersona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "persona_id", nullable = false)
    private Persona persona;

    @Lob
    @Column(name = "fotoDniFrente", columnDefinition = "LONGBLOB")
    private byte[] fotoDniFrente;

    @Lob
    @Column(name = "fotoDniDorso", columnDefinition = "LONGBLOB")
    private byte[] fotoDniDorso;
}
