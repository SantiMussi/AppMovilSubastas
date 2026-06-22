package com.subastas.backend.repository;

import com.subastas.backend.entity.ItemCatalogo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.List;

public interface ItemCatalogoRepository extends JpaRepository<ItemCatalogo, Integer> {
    List<ItemCatalogo> findByCatalogoIdentificador(Integer idCatalogo);
    List<ItemCatalogo> findByProductoIdentificador(Integer idProducto);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from ItemCatalogo i where i.identificador = :id")
    Optional<ItemCatalogo> findByIdForBid(@Param("id") Integer id);

    List<ItemCatalogo> findBySubastadoAndFechaCierreBefore(String subastado, java.time.LocalDateTime fechaCierre);
}