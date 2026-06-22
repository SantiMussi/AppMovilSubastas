package com.subastas.backend.service.impl;

import com.subastas.backend.entity.ItemCatalogo;
import com.subastas.backend.repository.ItemCatalogoRepository;
import com.subastas.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItemSubastaScheduler {

    private final ItemCatalogoRepository itemCatalogoRepository;
    private final AdminService adminService;

    @Scheduled(fixedRate = 1000)
    @Transactional
    public void closeExpiredItems() {
        LocalDateTime now = LocalDateTime.now();
        List<ItemCatalogo> expiredItems = itemCatalogoRepository.findBySubastadoAndFechaCierreBefore("no", now);

        for (ItemCatalogo item : expiredItems) {
            try {
                log.info("Cerrando el item {} automaticamente. Pasaron 60 segundos desde la ultima puja",
                        item.getIdentificador());
                adminService.adjudicarItemAutomaticamente(item.getIdentificador());
            } catch (Exception e) {
                log.error("Error al cerrar el item automaticamente {}", item.getIdentificador(), e);
            }
        }
    }
}
