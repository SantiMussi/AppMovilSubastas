package com.subastas.backend.service.impl;

import com.subastas.backend.entity.Subasta;
import com.subastas.backend.repository.SubastaRepository;
import com.subastas.backend.service.SubastaService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubastaServiceImpl implements SubastaService {

    private final SubastaRepository subastaRepository;

    @Override
    public List<Subasta> obtenerTodas() {
        return subastaRepository.findAll();
    }

    @Override
    public List<Subasta> obtenerActivas() {
        // En tu SQL, el estado de las subastas activas está definido como 'abierta'
        return subastaRepository.findByEstado("abierta");
    }

    @Override
    public Subasta obtenerPorId(Integer id) {
        return subastaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subasta no encontrada con el ID: " + id));
    }
}