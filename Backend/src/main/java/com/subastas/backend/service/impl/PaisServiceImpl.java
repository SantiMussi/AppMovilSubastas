package com.subastas.backend.service.impl;

import com.subastas.backend.entity.Pais;
import com.subastas.backend.repository.PaisRepository;
import com.subastas.backend.service.PaisService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaisServiceImpl implements PaisService {

    private final PaisRepository paisRepository;

    @Override
    public List<Pais> getAll() {
        return paisRepository.findAll();
    }

    @Override
    public Pais getById(Integer id) {
        return paisRepository.findById(id).orElse(null);
    }

    @Override
    public Pais save(Pais pais) {
        return paisRepository.save(pais);
    }
}
