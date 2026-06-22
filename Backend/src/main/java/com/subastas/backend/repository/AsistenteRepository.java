package com.subastas.backend.repository;

import com.subastas.backend.entity.Asistente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface AsistenteRepository extends JpaRepository<Asistente, Integer> {
    List<Asistente> findBySubastaIdentificador(Integer subastaId);
    Optional<Asistente> findByClienteIdentificadorAndSubastaIdentificador(Integer clienteId, Integer subastaId);

    @Query("""
            select a from Asistente a
            where a.cliente.identificador = :clienteId
              and lower(a.subasta.estado) = 'abierta'
              and a.subasta.identificador <> :subastaId
            order by a.subasta.identificador asc
            """)
    List<Asistente> findActiveAttendancesInOtherAuction(
            @Param("clienteId") Integer clienteId,
            @Param("subastaId") Integer subastaId);

    @Query("select coalesce(max(a.numeroPostor), 0) from Asistente a where a.subasta.identificador = :subastaId")
    Integer findMaxNumeroPostorBySubastaIdentificador(@Param("subastaId") Integer subastaId);

    Integer countByClienteIdentificador(Integer clienteId);
}