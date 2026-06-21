package com.subastas.backend.repository;

import com.subastas.backend.entity.Duenio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DuenioRepository extends JpaRepository<Duenio, Integer> {
}