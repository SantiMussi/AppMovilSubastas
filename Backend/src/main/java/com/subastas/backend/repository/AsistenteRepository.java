package com.subastas.backend.repository;

import com.subastas.backend.entity.Asistente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AsistenteRepository extends JpaRepository<Asistente, Integer> {
    List<Asistente> findBySubastaIdentificador(Integer subastaId);
    Optional<Asistente> findByClienteIdentificadorAndSubastaIdentificador(Integer clienteId, Integer subastaId);
    Integer countByClienteIdentificador(Integer clienteId);
}
