package com.subastas.backend.repository;

import com.subastas.backend.entity.Catalogo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CatalogoRepository extends JpaRepository<Catalogo, Integer> {
    List<Catalogo> findBySubastaIdentificador(Integer idSubasta);
}