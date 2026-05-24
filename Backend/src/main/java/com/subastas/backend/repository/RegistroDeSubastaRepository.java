package com.subastas.backend.repository;

import com.subastas.backend.entity.RegistroDeSubasta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistroDeSubastaRepository extends JpaRepository<RegistroDeSubasta, Integer> {
    List<RegistroDeSubasta> findByClienteIdentificador(Integer clienteId);
    List<RegistroDeSubasta> findBySubastaIdentificador(Integer subastaId);
}
