package com.subastas.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.subastas.backend.entity.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Integer>{
} 
