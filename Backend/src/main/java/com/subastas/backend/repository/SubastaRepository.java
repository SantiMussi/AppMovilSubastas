package com.subastas.backend.repository;

import com.subastas.backend.entity.Subasta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubastaRepository extends JpaRepository<Subasta, Integer> {
    List<Subasta> findByEstado(String estado);
}