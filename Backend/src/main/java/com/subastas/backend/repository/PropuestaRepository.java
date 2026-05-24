package com.subastas.backend.repository;

import com.subastas.backend.entity.Propuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropuestaRepository extends JpaRepository<Propuesta, Integer> {
    List<Propuesta> findByClienteIdentificador(Integer clienteId);
}
