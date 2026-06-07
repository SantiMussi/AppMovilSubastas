package com.subastas.backend.repository;

import com.subastas.backend.entity.Foto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface FotoRepository extends JpaRepository<Foto, Integer> {

    @Query("select f.identificador from Foto f where f.producto.identificador = :productoId order by f.identificador asc")
    List<Integer> findIdsByProductoIdentificadorOrderByIdentificadorAsc(@Param("productoId") Integer productoId);

    @Query("select f.producto.identificador as productoId, f.identificador as photoId from Foto f "
            + "where f.producto.identificador in :productoIds and f.identificador = "
            + "(select min(f2.identificador) from Foto f2 where f2.producto.identificador = f.producto.identificador)")
    List<FotoPrincipalProjection> findFirstIdsByProductoIdentificadorIn(@Param("productoIds") Set<Integer> productoIds);

    @Query("select f.foto from Foto f where f.identificador = :photoId")
    Optional<byte[]> findContentByIdentificador(@Param("photoId") Integer photoId);
    
    long countByProductoIdentificador(Integer productoId);
    
    interface FotoPrincipalProjection {
        Integer getProductoId();
        Integer getPhotoId();
    }
}

