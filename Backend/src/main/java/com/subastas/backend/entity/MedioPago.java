package com.subastas.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "mediosPago")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedioPago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "persona", nullable = false)
    private Persona persona;

    @Column(name = "tipo", nullable = false, length = 50)
    private String tipo;

    @Column(name = "entidad", nullable = false, length = 150)
    private String entidad;

    @Column(name = "numeroIdentificacion", nullable = false, length = 80)
    private String numeroIdentificacion;

    @Column(name = "moneda", nullable = false, length = 10)
    private String moneda;

    @Column(name = "montoGarantia", precision = 18, scale = 2)
    private BigDecimal montoGarantia;

    @Column(name = "comprobante", length = 1000)
    private String comprobante;

    @Column(name = "verificado", nullable = false)
    private Boolean verificado;

    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @Column(name = "usadoEnOperacion", nullable = false)
    private Boolean usadoEnOperacion;
}
