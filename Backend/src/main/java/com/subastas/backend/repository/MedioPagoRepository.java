package com.subastas.backend.repository;

import com.subastas.backend.entity.MedioPago;
import com.subastas.backend.entity.Persona;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedioPagoRepository extends JpaRepository<MedioPago, Integer> {
    List<MedioPago> findByPersonaAndActivoTrue(Persona persona);

    List<MedioPago> findByPersonaAndActivoTrueAndVerificadoTrue(Persona persona);
}