package com.subastas.backend.service;

import com.subastas.backend.entity.Subasta;
import java.util.List;

public interface SubastaService {
    List<Subasta> obtenerTodas();
    List<Subasta> obtenerActivas();
    Subasta obtenerPorId(Integer id);
}