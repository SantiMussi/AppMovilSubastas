package com.subastas.backend.service.impl;

import com.subastas.backend.entity.Asistente;
import com.subastas.backend.entity.Categoria;
import com.subastas.backend.entity.Cliente;
import com.subastas.backend.entity.ItemCatalogo;
import com.subastas.backend.entity.MedioPago;
import com.subastas.backend.entity.Pujo;
import com.subastas.backend.entity.PujoMetadata;
import com.subastas.backend.entity.Subasta;
import com.subastas.backend.entity.Usuario;
import com.subastas.backend.exception.PujaRechazadaException;
import com.subastas.backend.repository.AsistenteRepository;
import com.subastas.backend.repository.ClienteRepository;
import com.subastas.backend.repository.ItemCatalogoRepository;
import com.subastas.backend.repository.MedioPagoRepository;
import com.subastas.backend.repository.MonedaSubastaRepository;
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
    private final ClienteRepository clienteRepository;
    private final AsistenteRepository asistenteRepository;
    private final MultaRepository multaRepository;
    private final MedioPagoRepository medioPagoRepository;
    private final MonedaSubastaRepository monedaSubastaRepository;

    @Override
    @Transactional
    public void registrarAsistenteSiPuedePujar(Integer auctionItemId, String userEmail) {
        BidContext context = validateBidContext(auctionItemId, userEmail);
        findOrCreateAttendee(context.client(), context.auction());
    }

    @Override
    @Transactional
    public Pujo realizarPuja(Integer auctionItemId, String userEmail, BigDecimal amount, Integer paymentMethodId) {
        return realizarPujaInterna(auctionItemId, userEmail, amount, paymentMethodId);
    }

    private Pujo realizarPujaInterna(
            Integer auctionItemId,
            String userEmail,
            BigDecimal amount,
            Integer paymentMethodId) {
        validateAmount(amount);
        BidContext context = validateBidContext(auctionItemId, userEmail);

        BigDecimal normalizedAmount = amount.setScale(2, RoundingMode.UNNECESSARY);
        BigDecimal currentBid = pujoRepository
                .findFirstByItemIdentificadorOrderByImporteDescIdentificadorDesc(auctionItemId)
                .map(Pujo::getImporte)
                .orElse(context.item().getPrecioBase())
                .setScale(2, RoundingMode.HALF_UP);
        validateRange(normalizedAmount, currentBid, context.item().getPrecioBase(), context.auction().getCategoria());
        MedioPago paymentMethod = validatePaymentMethod(paymentMethodId, normalizedAmount, context);
        Asistente attendee = findOrCreateAttendee(context.client(), context.auction());

        Pujo bid = new Pujo();
        bid.setAsistente(attendee);
        bid.setItem(context.item());
        bid.setImporte(normalizedAmount);
        bid.setGanador("no");
        bid = pujoRepository.saveAndFlush(bid);

        PujoMetadata metadata = new PujoMetadata();
        metadata.setPujo(bid);
        pujoMetadataRepository.save(metadata);
        paymentMethod.setUsadoEnOperacion(true);
        medioPagoRepository.save(paymentMethod);
        context.item().setFechaCierre(java.time.LocalDateTime.now().plusSeconds(60));
        itemCatalogoRepository.save(context.item());

        return bid;
    }

    private BidContext validateBidContext(Integer auctionItemId, String userEmail) {
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
        Cliente client = clienteRepository.findById(user.getPersona().getIdentificador())
                .orElseThrow(() -> rejected("CLIENT_NOT_FOUND", "El usuario no tiene un cliente asociado."));
        if (!"si".equalsIgnoreCase(client.getAdmitido())) {
            throw rejected("CLIENT_NOT_ADMITTED", "El usuario no está habilitado para participar.");
        }
        if (multaRepository.existsByUsuarioIdentificadorAndEstadoIn(user.getIdentificador(), BLOCKING_FINE_STATES)) {
            throw rejected("OUTSTANDING_FINE", "Debes cancelar tus multas pendientes antes de volver a pujar.");
        }
        return new BidContext(item, auction, client);
    }

    private MedioPago validatePaymentMethod(Integer paymentMethodId, BigDecimal amount, BidContext context) {
        if (paymentMethodId == null) {
            throw rejected("PAYMENT_METHOD_REQUIRED", "Debes seleccionar un medio de pago verificado antes de pujar.");
        }
        MedioPago paymentMethod = medioPagoRepository.findById(paymentMethodId)
                .orElseThrow(() -> rejected("PAYMENT_METHOD_NOT_FOUND", "El medio de pago seleccionado no existe."));
        Integer ownerId = paymentMethod.getPersona() == null ? null : paymentMethod.getPersona().getIdentificador();
        if (!context.client().getIdentificador().equals(ownerId)) {
            throw rejected("PAYMENT_METHOD_NOT_OWNED",
                    "El medio de pago seleccionado no pertenece al usuario autenticado.");
        }
        if (!Boolean.TRUE.equals(paymentMethod.getActivo()) || !Boolean.TRUE.equals(paymentMethod.getVerificado())) {
            throw rejected("PAYMENT_METHOD_NOT_VERIFIED", "El medio de pago seleccionado no está activo y verificado.");
        }
        String auctionCurrency = monedaSubastaRepository.findById(context.auction().getIdentificador())
                .map(moneda -> moneda.getMoneda())
                .orElse(null);
        if (auctionCurrency != null && (paymentMethod.getMoneda() == null
                || !auctionCurrency.equalsIgnoreCase(paymentMethod.getMoneda()))) {
            throw rejected("PAYMENT_CURRENCY_MISMATCH",
                    "La moneda del medio de pago no coincide con la moneda de la subasta.");
        }
        if (paymentMethod.getMontoGarantia() != null && paymentMethod.getMontoGarantia().compareTo(amount) < 0) {
            throw rejected("INSUFFICIENT_GUARANTEE",
                    "El medio de pago no tiene garantía suficiente para cubrir la puja.");
        }
        return paymentMethod;
    }

    private Asistente findOrCreateAttendee(Cliente client, Subasta auction) {
        return asistenteRepository
                .findByClienteIdentificadorAndSubastaIdentificador(client.getIdentificador(),
                        auction.getIdentificador())
                .orElseGet(() -> {
                    validateNoOtherOpenAuctionAttendance(client, auction);
                    return createAttendee(client, auction);
                });
    }

    private void validateNoOtherOpenAuctionAttendance(Cliente client, Subasta auction) {
        asistenteRepository.findActiveAttendancesInOtherAuction(
                client.getIdentificador(),
                auction.getIdentificador())
                .stream()
                .findFirst()
                .ifPresent(activeAttendance -> {
                    Integer activeAuctionId = activeAttendance.getSubasta() == null
                            ? null
                            : activeAttendance.getSubasta().getIdentificador();
                    throw rejected(
                            "ALREADY_IN_OPEN_AUCTION",
                            "Ya estás participando en la subasta " + activeAuctionId
                                    + ". No puedes ingresar a otra subasta hasta que la sala inicial esté cerrada.");
                });
    }

    private Asistente createAttendee(Cliente client, Subasta auction) {
        Asistente attendee = new Asistente();
        attendee.setCliente(client);
        attendee.setSubasta(auction);
        attendee.setNumeroPostor(
                asistenteRepository.findMaxNumeroPostorBySubastaIdentificador(auction.getIdentificador()) + 1);
        return asistenteRepository.save(attendee);
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

    private record BidContext(ItemCatalogo item, Subasta auction, Cliente client) {
    }
}
