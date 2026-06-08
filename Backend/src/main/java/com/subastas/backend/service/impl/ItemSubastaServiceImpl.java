package com.subastas.backend.service.impl;

import com.subastas.backend.dto.response.producto.ItemFotoProductoResponse;
import com.subastas.backend.dto.response.puja.HistorialPujaResponse;
import com.subastas.backend.dto.response.puja.ItemHistorialPujaResponse;
import com.subastas.backend.dto.response.puja.TopPujaResponse;
import com.subastas.backend.dto.response.subasta.DetalleItemSubastaResponse;
import com.subastas.backend.dto.response.subasta.ResumenDueñoResponse;
import com.subastas.backend.entity.ItemCatalogo;
import com.subastas.backend.entity.Subasta;
import com.subastas.backend.entity.Pujo;
import com.subastas.backend.exception.ResourceNotFoundException;
import com.subastas.backend.entity.Categoria;
import com.subastas.backend.repository.ItemCatalogoRepository;
import com.subastas.backend.repository.MonedaSubastaRepository;
import com.subastas.backend.repository.PujoRepository;
import com.subastas.backend.service.FotoService;
import com.subastas.backend.service.ItemSubastaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Set;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ItemSubastaServiceImpl implements ItemSubastaService {

    private static final String DEFAULT_CURRENCY = "ARS";
    private static final BigDecimal MIN_BID_INCREMENT_RATE = new BigDecimal("0.01");
    private static final BigDecimal MAX_BID_INCREMENT_RATE = new BigDecimal("0.20");
    private static final Set<Categoria> UNCAPPED_CATEGORIES = Set.of(Categoria.oro, Categoria.platino);

    private final ItemCatalogoRepository itemCatalogoRepository;
    private final PujoRepository pujoRepository;
    private final MonedaSubastaRepository monedaSubastaRepository;
    private final FotoService fotoService;

    @Override
    public DetalleItemSubastaResponse obtenerDetalle(Integer auctionItemId) {
        ItemCatalogo item = obtenerItem(auctionItemId);

        DetalleItemSubastaResponse response = new DetalleItemSubastaResponse();
        response.setAuctionItemId(item.getIdentificador());
        response.setPrecioBase(item.getPrecioBase());
        response.setComision(item.getComision());
        response.setSubastado(esSi(item.getSubastado()));
        
        Subasta auction = item.getCatalogo() == null ? null : item.getCatalogo().getSubasta();
        if (auction != null) {
            boolean auctionClosed = !"abierta".equalsIgnoreCase(auction.getEstado());
            response.setAuctionId(auction.getIdentificador());
            response.setAuctionStatus(auction.getEstado());
            response.setAuctionClosed(auctionClosed);
            response.setBiddingOpen(!auctionClosed && !response.getSubastado());
        }


        if (item.getProducto() != null) {
            response.setProductId(item.getProducto().getIdentificador());
            response.setDescription(item.getProducto().getDescripcionCatalogo());
            response.setHistoria(item.getProducto().getDescripcionCompleta());
            response.setImagenes(fotoService.obtenerFotosProducto(item.getProducto().getIdentificador())
                    .stream()
                    .map(ItemFotoProductoResponse::getUrl)
                    .toList());

            if (item.getProducto().getDuenio() != null && item.getProducto().getDuenio().getPersona() != null) {
                ResumenDueñoResponse owner = new ResumenDueñoResponse();
                owner.setOwnerId(item.getProducto().getDuenio().getIdentificador());
                owner.setNombre(item.getProducto().getDuenio().getPersona().getNombre());
                response.setOwnerSummary(owner);
            }
        }

        return response;
    }

    @Override
    public TopPujaResponse obtenerMejorPuja(Integer auctionItemId) {
        ItemCatalogo item = obtenerItem(auctionItemId);
        Pujo topBid = pujoRepository.findFirstByItemIdentificadorOrderByImporteDescIdentificadorDesc(auctionItemId)
                .orElse(null);
        BigDecimal currentBid = topBid != null ? topBid.getImporte() : item.getPrecioBase();

        TopPujaResponse response = new TopPujaResponse();
        response.setAuctionItemId(item.getIdentificador());
        response.setCurrentBid(currentBid);
        Integer auctionId = item.getCatalogo() != null && item.getCatalogo().getSubasta() != null
                ? item.getCatalogo().getSubasta().getIdentificador()
                : null;
        response.setCurrency(auctionId == null ? DEFAULT_CURRENCY : monedaSubastaRepository.findById(auctionId)
                .map(moneda -> moneda.getMoneda())
                .orElse(DEFAULT_CURRENCY));
        response.setBidderNumber(topBid != null && topBid.getAsistente() != null
                ? topBid.getAsistente().getNumeroPostor()
                : null);
        response.setBidderName(resolveBidderName(topBid));
        Categoria category = item.getCatalogo() != null && item.getCatalogo().getSubasta() != null
                ? item.getCatalogo().getSubasta().getCategoria()
                : null;
        boolean appliesCap = category == null || !UNCAPPED_CATEGORIES.contains(category);
        BigDecimal minimumIncrement = appliesCap
                ? item.getPrecioBase().multiply(MIN_BID_INCREMENT_RATE).setScale(2, RoundingMode.HALF_UP)
                : new BigDecimal("0.01");
        response.setNextMinBid(currentBid.add(minimumIncrement));
        response.setNextMaxBid(appliesCap
                ? currentBid.add(item.getPrecioBase().multiply(MAX_BID_INCREMENT_RATE).setScale(2, RoundingMode.HALF_UP))
                : null);
        response.setAppliesCap(appliesCap);
        return response;
    }

    @Override
    public HistorialPujaResponse obtenerHistorialPujas(Integer auctionItemId, int page, int size) {
        obtenerItem(auctionItemId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "identificador"));
        List<ItemHistorialPujaResponse> items = pujoRepository.findByItemIdentificador(auctionItemId, pageable)
                .stream()
                .map(this::mapBid)
                .toList();

        HistorialPujaResponse response = new HistorialPujaResponse();
        response.setItems(items);
        return response;
    }

    private ItemCatalogo obtenerItem(Integer auctionItemId) {
        return itemCatalogoRepository.findById(auctionItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Ítem de subasta no encontrado con id: " + auctionItemId));
    }

    private ItemHistorialPujaResponse mapBid(Pujo pujo) {
        ItemHistorialPujaResponse response = new ItemHistorialPujaResponse();
        response.setBidId(pujo.getIdentificador());
        response.setBidderNumber(pujo.getAsistente() != null ? pujo.getAsistente().getNumeroPostor() : null);
        response.setBidderName(resolveBidderName(pujo));
        response.setImporte(pujo.getImporte());
        response.setFecha(pujo.getMetadata() != null ? pujo.getMetadata().getFecha() : null);
        return response;
    }

	private String resolveBidderName(Pujo pujo) {
        if (pujo == null || pujo.getAsistente() == null || pujo.getAsistente().getCliente() == null
                || pujo.getAsistente().getCliente().getPersona() == null) {
            return null;
        }
        return pujo.getAsistente().getCliente().getPersona().getNombre();
    }

    private boolean esSi(String value) {
        return "si".equalsIgnoreCase(value);
    }
}