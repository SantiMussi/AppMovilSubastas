package com.subastas.backend.repository;

import com.subastas.backend.entity.FotoPropuesta;
import com.subastas.backend.entity.Propuesta;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FotoPropuestaRepository extends JpaRepository<FotoPropuesta, Integer> {
    List<FotoPropuesta> findByPropuesta(Propuesta propuesta);
}