package com.subastas.backend.service.impl;
import com.subastas.backend.entity.Categoria;
import com.subastas.backend.entity.ItemCatalogo;
import com.subastas.backend.entity.Pujo;
import com.subastas.backend.entity.PujoMetadata;
import com.subastas.backend.entity.Subasta;
import com.subastas.backend.entity.Usuario;
import com.subastas.backend.entity.Asistente;
import com.subastas.backend.exception.PujaRechazadaException;
import com.subastas.backend.repository.AsistenteRepository;
import com.subastas.backend.repository.ItemCatalogoRepository;
import com.subastas.backend.repository.MultaRepository;
import com.subastas.backend.repository.PujoMetadataRepository;
import com.subastas.backend.repository.PujoRepository;
import com.subastas.backend.repository.UsuarioRepository;
import com.subastas.backend.service.PujaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PujaServiceImpl implements PujaService {

    private static final BigDecimal MIN_INCREMENT_RATE = new BigDecimal("0.01");
    private static final BigDecimal MAX_INCREMENT_RATE = new BigDecimal("0.20");
    private static final Set<Categoria> UNCAPPED_CATEGORIES = Set.of(Categoria.oro, Categoria.platino);
    private static final List<String> BLOCKING_FINE_STATES = List.of("pendiente", "vencida");

    private final ItemCatalogoRepository itemCatalogoRepository;
    private final PujoRepository pujoRepository;
    private final PujoMetadataRepository pujoMetadataRepository;
    private final UsuarioRepository usuarioRepository;
    private final AsistenteRepository asistenteRepository;
    private final MultaRepository multaRepository;

    @Override
    @Transactional
    public Pujo realizarPuja(Integer auctionItemId, String userEmail, BigDecimal amount) {
        validateAmount(amount);
        ItemCatalogo item = itemCatalogoRepository.findByIdForBid(auctionItemId)
                .orElseThrow(() -> rejected("AUCTION_ITEM_NOT_FOUND", "El ítem de subasta no existe."));
        Subasta auction = item.getCatalogo() == null ? null : item.getCatalogo().getSubasta();
        if (auction == null || !"abierta".equalsIgnoreCase(auction.getEstado())) {
            throw rejected("AUCTION_NOT_OPEN", "La subasta no está abierta para recibir pujas.");
        }
        if ("si".equalsIgnoreCase(item.getSubastado())) {
            throw rejected("AUCTION_ITEM_SOLD", "El lote ya fue vendido.");
        }

        Usuario user = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> rejected("USER_NOT_FOUND", "No se encontró el usuario autenticado."));
        if (user.getPersona() == null) {
            throw rejected("CLIENT_NOT_FOUND", "El usuario no tiene un cliente asociado.");
        }
        Integer clientId = user.getPersona().getIdentificador();
        Asistente attendee = asistenteRepository
                .findByClienteIdentificadorAndSubastaIdentificador(clientId, auction.getIdentificador())
                .orElseThrow(() -> rejected("NOT_REGISTERED", "Debes estar registrado como asistente de esta subasta para pujar."));
        if (!"si".equalsIgnoreCase(attendee.getCliente().getAdmitido())) {
            throw rejected("CLIENT_NOT_ADMITTED", "El usuario no está habilitado para participar.");
        }
        if (multaRepository.existsByUsuarioIdentificadorAndEstadoIn(user.getIdentificador(), BLOCKING_FINE_STATES)) {
            throw rejected("OUTSTANDING_FINE", "Debes cancelar tus multas pendientes antes de volver a pujar.");
        }

        BigDecimal normalizedAmount = amount.setScale(2, RoundingMode.UNNECESSARY);
        BigDecimal currentBid = pujoRepository
                .findFirstByItemIdentificadorOrderByImporteDescIdentificadorDesc(auctionItemId)
                .map(Pujo::getImporte)
                .orElse(item.getPrecioBase())
                .setScale(2, RoundingMode.HALF_UP);
        validateRange(normalizedAmount, currentBid, item.getPrecioBase(), auction.getCategoria());

        Pujo bid = new Pujo();
        bid.setAsistente(attendee);
        bid.setItem(item);
        bid.setImporte(normalizedAmount);
        bid.setGanador("no");
        bid = pujoRepository.saveAndFlush(bid);

        PujoMetadata metadata = new PujoMetadata();
        metadata.setPujo(bid);
        pujoMetadataRepository.save(metadata);
        return bid;
    }

    private void validateAmount(BigDecimal amount) {
        if (amount == null || amount.signum() <= 0) {
            throw rejected("INVALID_AMOUNT", "El importe de la puja debe ser mayor que cero.");
        }
        if (amount.scale() > 2) {
            throw rejected("INVALID_AMOUNT", "El importe de la puja admite como máximo dos decimales.");
        }
    }

    private void validateRange(BigDecimal amount, BigDecimal currentBid, BigDecimal basePrice, Categoria category) {
        if (category != null && UNCAPPED_CATEGORIES.contains(category)) {
            if (amount.compareTo(currentBid) <= 0) {
                throw rejected("BID_TOO_LOW", "La puja debe superar la mejor oferta actual.");
            }
            return;
        }
        BigDecimal min = currentBid.add(basePrice.multiply(MIN_INCREMENT_RATE)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal max = currentBid.add(basePrice.multiply(MAX_INCREMENT_RATE)).setScale(2, RoundingMode.HALF_UP);
        if (amount.compareTo(min) < 0) {
            throw rejected("BID_TOO_LOW", "La puja mínima permitida es " + min.toPlainString() + ".");
        }
        if (amount.compareTo(max) > 0) {
            throw rejected("BID_TOO_HIGH", "La puja máxima permitida es " + max.toPlainString() + ".");
        }
    }

    private PujaRechazadaException rejected(String code, String message) {
        return new PujaRechazadaException(code, message);
    }
}
