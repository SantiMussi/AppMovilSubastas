package com.subastas.backend.repository;

import com.subastas.backend.entity.Pujo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PujoRepository extends JpaRepository<Pujo, Integer> {
    Optional<Pujo> findFirstByItemIdentificadorOrderByImporteDescIdentificadorDesc(Integer itemId);

    Page<Pujo> findByItemIdentificador(Integer itemId, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT AVG(p.importe) FROM Pujo p WHERE p.asistente.cliente.identificador = :clienteId")
    Double getAveragePujaByClienteId(@org.springframework.data.repository.query.Param("clienteId") Integer clienteId);

    java.util.List<Pujo> findByAsistenteClienteIdentificador(Integer clienteId);
}