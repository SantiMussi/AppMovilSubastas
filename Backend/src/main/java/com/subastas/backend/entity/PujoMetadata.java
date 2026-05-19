package com.subastas.backend.entity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

// la unica razon por la que existe esta clase es porque pujos no tiene fecha

@Data
@Entity
@Table(name = "pujosMetadata")
public class PujoMetadata {
   
    @Id
    @Column(name = "pujo")
    private Integer pujoId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "pujo", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Pujo pujo;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime fecha;
}
