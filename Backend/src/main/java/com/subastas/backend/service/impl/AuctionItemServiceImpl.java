package com.subastas.backend.service.impl;

import com.subastas.backend.dto.response.AuctionItemDetailResponse;
import com.subastas.backend.dto.response.BidHistoryItemResponse;
import com.subastas.backend.dto.response.BidHistoryResponse;
import com.subastas.backend.dto.response.OwnerSummaryResponse;
import com.subastas.backend.dto.response.TopBidResponse;
import com.subastas.backend.entity.Foto;
import com.subastas.backend.entity.ItemCatalogo;
import com.subastas.backend.entity.Pujo;
import com.subastas.backend.exception.ResourceNotFoundException;
import com.subastas.backend.repository.FotoRepository;
import com.subastas.backend.repository.ItemCatalogoRepository;
import com.subastas.backend.repository.PujoRepository;
import com.subastas.backend.service.AuctionItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AuctionItemServiceImpl implements AuctionItemService {

    private static final String DEFAULT_CURRENCY = "ARS";
    private static final BigDecimal MIN_BID_INCREMENT = new BigDecimal("200.00");
    private static final BigDecimal MAX_BID_INCREMENT = new BigDecimal("4000.00");

    private final ItemCatalogoRepository itemCatalogoRepository;
    private final PujoRepository pujoRepository;
    private final FotoRepository fotoRepository;

    @Override
    public AuctionItemDetailResponse obtenerDetalle(Integer auctionItemId) {
        ItemCatalogo item = obtenerItem(auctionItemId);

        AuctionItemDetailResponse response = new AuctionItemDetailResponse();
        response.setAuctionItemId(item.getIdentificador());
        response.setPrecioBase(item.getPrecioBase());
        response.setComision(item.getComision());
        response.setSubastado(esSi(item.getSubastado()));

        if (item.getProducto() != null) {
            response.setProductId(item.getProducto().getIdentificador());
            response.setDescription(item.getProducto().getDescripcionCatalogo());
            response.setHistoria(item.getProducto().getDescripcionCompleta());
            response.setImagenes(fotoRepository
                    .findByProductoIdentificadorOrderByIdentificadorAsc(item.getProducto().getIdentificador())
                    .stream()
                    .map(this::buildPhotoUrl)
                    .toList());

            if (item.getProducto().getDuenio() != null && item.getProducto().getDuenio().getPersona() != null) {
                OwnerSummaryResponse owner = new OwnerSummaryResponse();
                owner.setOwnerId(item.getProducto().getDuenio().getIdentificador());
                owner.setNombre(item.getProducto().getDuenio().getPersona().getNombre());
                response.setOwnerSummary(owner);
            }
        }

        return response;
    }

    @Override
    public TopBidResponse obtenerMejorPuja(Integer auctionItemId) {
        ItemCatalogo item = obtenerItem(auctionItemId);
        Pujo topBid = pujoRepository.findFirstByItemIdentificadorOrderByImporteDescIdentificadorDesc(auctionItemId)
                .orElse(null);
        BigDecimal currentBid = topBid != null ? topBid.getImporte() : item.getPrecioBase();

        TopBidResponse response = new TopBidResponse();
        response.setAuctionItemId(item.getIdentificador());
        response.setCurrentBid(currentBid);
        response.setCurrency(DEFAULT_CURRENCY);
        response.setBidderNumber(topBid != null && topBid.getAsistente() != null
                ? topBid.getAsistente().getNumeroPostor()
                : null);
        response.setNextMinBid(currentBid.add(MIN_BID_INCREMENT));
        response.setNextMaxBid(currentBid.add(MAX_BID_INCREMENT));
        response.setAppliesCap(true);
        return response;
    }

    @Override
    public BidHistoryResponse obtenerHistorialPujas(Integer auctionItemId, int page, int size) {
        obtenerItem(auctionItemId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "identificador"));
        List<BidHistoryItemResponse> items = pujoRepository.findByItemIdentificador(auctionItemId, pageable)
                .stream()
                .map(this::mapBid)
                .toList();

        BidHistoryResponse response = new BidHistoryResponse();
        response.setItems(items);
        return response;
    }

    private ItemCatalogo obtenerItem(Integer auctionItemId) {
        return itemCatalogoRepository.findById(auctionItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Ítem de subasta no encontrado con id: " + auctionItemId));
    }

    private BidHistoryItemResponse mapBid(Pujo pujo) {
        BidHistoryItemResponse response = new BidHistoryItemResponse();
        response.setBidId(pujo.getIdentificador());
        response.setBidderNumber(pujo.getAsistente() != null ? pujo.getAsistente().getNumeroPostor() : null);
        response.setImporte(pujo.getImporte());
        response.setFecha(pujo.getMetadata() != null ? pujo.getMetadata().getFecha() : null);
        return response;
    }

    private boolean esSi(String value) {
        return "si".equalsIgnoreCase(value);
    }

    private String buildPhotoUrl(Foto foto) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/v1/products/photos/{photoId}/content")
                .buildAndExpand(foto.getIdentificador())
                .toUriString();
    }
}