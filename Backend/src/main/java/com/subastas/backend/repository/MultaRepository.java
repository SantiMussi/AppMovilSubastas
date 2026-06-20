package com.subastas.backend.repository;

import com.subastas.backend.entity.Multa;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MultaRepository extends JpaRepository<Multa, Integer> {
    List<Multa> findByUsuarioIdentificador(Integer idUsuario);
    boolean existsByUsuarioIdentificadorAndEstadoIn(Integer idUsuario, List<String> estados);
}
