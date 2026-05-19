package com.subastas.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.subastas.backend.entity.Foto;

@Repository
public interface FotoRepository extends JpaRepository<Foto, Integer>{
    List<Foto> findByProductoIdentificadorOrderByIdentificadorAsc(Integer productoId);   
    
    long countByProductoIdentificador(Integer productoId);
}

