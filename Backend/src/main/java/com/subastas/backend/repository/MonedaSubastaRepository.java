package com.subastas.backend.repository;

import com.subastas.backend.entity.MonedaSubasta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MonedaSubastaRepository extends JpaRepository<MonedaSubasta, Integer> {
    Optional<MonedaSubasta> findBySubasta(Integer subastaId);
}
