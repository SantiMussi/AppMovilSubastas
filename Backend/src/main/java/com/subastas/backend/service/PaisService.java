package com.subastas.backend.service;

import com.subastas.backend.entity.Pais;
import java.util.List;

public interface PaisService {
    List<Pais> getAll();
    Pais getById(Integer id);
    Pais save(Pais pais);
}
