package com.subastas.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "monedaSubasta")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonedaSubasta {

    @Id
    @Column(name = "monedaSubasta")
    private Integer monedaSubastaId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "subasta")
    private Subasta subasta;

    @Column(nullable = false, length = 3)
    private String moneda;
}