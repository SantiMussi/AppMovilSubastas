package com.subastas.backend.repository;

import com.subastas.backend.entity.Propuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PropuestaRepository extends JpaRepository<Propuesta, Integer> {
    List<Propuesta> findByClienteIdentificador(Integer clienteId);
    Optional<Propuesta> findByIdentificadorAndClienteIdentificador(Integer propuestaId, Integer clienteId);
}