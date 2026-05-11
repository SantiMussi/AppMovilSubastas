package com.subastas.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "seguros")
public class Seguro {

    @Id
    @Column(length = 30)
    private String nroPoliza;

    @Column(nullable = false, length = 150)
    private String compania;

    @Column(length = 2)
    private String polizaCombinada;

    @Column(nullable = false)
    private BigDecimal importe;
}