package com.subastas.backend.repository;

import com.subastas.backend.entity.RegistroDeSubasta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RegistroDeSubastaRepository extends JpaRepository<RegistroDeSubasta, Integer> {
    List<RegistroDeSubasta> findByClienteIdentificador(Integer clienteId);
    List<RegistroDeSubasta> findBySubastaIdentificador(Integer subastaId);
    List<RegistroDeSubasta> findByProductoIdentificador(Integer productId);
}
