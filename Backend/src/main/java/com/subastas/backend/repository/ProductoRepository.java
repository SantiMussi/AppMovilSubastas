package com.subastas.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.subastas.backend.entity.Producto;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer>{
} 
