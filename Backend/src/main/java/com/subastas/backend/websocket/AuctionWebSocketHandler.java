package com.subastas.backend.websocket;

import com.fasterxml.jackson.databind.json.JsonMapper;
import com.subastas.backend.dto.request.RealizarPujaRequest;
import com.subastas.backend.dto.response.puja.PujaAceptadaResponse;
import com.subastas.backend.dto.response.puja.PujaRechazadaResponse;
import com.subastas.backend.dto.response.puja.PujasEnVivoSnapshotResponse;
import com.subastas.backend.entity.Pujo;
import com.subastas.backend.exception.PujaRechazadaException;
import com.subastas.backend.service.ItemSubastaService;
import com.subastas.backend.service.PujaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionWebSocketHandler extends TextWebSocketHandler {

    private static final int HISTORY_SIZE = 20;

    private final ItemSubastaService itemSubastaService;
    private final PujaService pujaService;
    private final JsonMapper jsonMapper = JsonMapper.builder().findAndAddModules().build();
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        Optional<Integer> itemId = auctionItemId(session);
        String email = userEmail(session);
        if (itemId.isEmpty() || email == null) {
            closeInvalidAuctionSession(session);
            return;
        }
        WebSocketSession previous = userSessions.put(email, session);
        if (previous != null && previous.isOpen() && !previous.getId().equals(session.getId())) {
            previous.close(CloseStatus.POLICY_VIOLATION.withReason("A user can only join one auction room at a time"));
        }
        sessions.put(session.getId(), session);
        sendSnapshot(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        RealizarPujaRequest request;
        try {
            request = jsonMapper.readValue(message.getPayload(), RealizarPujaRequest.class);
        } catch (IOException | RuntimeException exception) {
            sendRejection(session, "INVALID_MESSAGE", "El mensaje enviado no es válido.");
            return;
        }
        if (!"place_bid".equals(request.getType())) {
            sendSnapshot(session);
            return;
        }
        Integer itemId = auctionItemId(session).orElse(null);
        String email = userEmail(session);
        if (itemId == null || email == null) {
            closeInvalidAuctionSession(session);
            return;
        }
        try {
            Pujo bid = pujaService.realizarPuja(itemId, email, request.getAmount());
            send(session, new PujaAceptadaResponse("bid_accepted", Instant.now(), bid.getIdentificador(), itemId, bid.getImporte()));
            broadcastSnapshot(itemId);
        } catch (PujaRechazadaException exception) {
            sendRejection(session, exception.getCode(), exception.getMessage());
        } catch (RuntimeException exception) {
            log.error("Unexpected error while placing a bid for item {}", itemId, exception);
            sendRejection(session, "BID_ERROR", "No se pudo registrar la puja. Intenta nuevamente.");
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        removeSession(session);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        removeSession(session);
        if (session.isOpen()) session.close(CloseStatus.SERVER_ERROR);
    }

    @Scheduled(fixedDelayString = "${app.auction.live-refresh-ms:10000}")
    public void broadcastSnapshots() {
        sessions.values().forEach(session -> {
            try {
                sendSnapshot(session);
            } catch (Exception exception) {
                log.debug("Unable to send auction update to session {}", session.getId(), exception);
                removeSession(session);
            }
        });
    }

    private void broadcastSnapshot(Integer itemId) {
        sessions.values().stream().filter(session -> auctionItemId(session).filter(itemId::equals).isPresent()).forEach(session -> {
            try {
                sendSnapshot(session);
            } catch (IOException exception) {
                removeSession(session);
            }
        });
    }

    private void sendSnapshot(WebSocketSession session) throws IOException {
        if (!session.isOpen()) {
            removeSession(session);
            return;
        }
        Integer itemId = auctionItemId(session).orElseThrow();
        send(session, new PujasEnVivoSnapshotResponse("auction_snapshot", Instant.now(),
                itemSubastaService.obtenerDetalle(itemId), itemSubastaService.obtenerMejorPuja(itemId),
                itemSubastaService.obtenerHistorialPujas(itemId, 0, HISTORY_SIZE)));
    }

    private void sendRejection(WebSocketSession session, String code, String message) throws IOException {
        Integer itemId = auctionItemId(session).orElse(null);
        send(session, new PujaRechazadaResponse("bid_rejected", code, message,
                itemId == null ? null : itemSubastaService.obtenerMejorPuja(itemId)));
    }

    private void send(WebSocketSession session, Object payload) throws IOException {
        synchronized (session) {
            if (session.isOpen()) session.sendMessage(new TextMessage(jsonMapper.writeValueAsString(payload)));
        }
    }

    private Optional<Integer> auctionItemId(WebSocketSession session) {
        String path = session.getUri() == null ? "" : session.getUri().getPath();
        String id = path.substring(path.lastIndexOf('/') + 1);
        try {
            int parsedId = Integer.parseInt(id);
            return parsedId > 0 ? Optional.of(parsedId) : Optional.empty();
        } catch (NumberFormatException exception) {
            return Optional.empty();
        }
    }

    private String userEmail(WebSocketSession session) {
        Object email = session.getAttributes().get(AuctionWebSocketAuthInterceptor.USER_EMAIL_ATTRIBUTE);
        return email instanceof String value ? value : null;
    }

    private void removeSession(WebSocketSession session) {
        sessions.remove(session.getId());
        String email = userEmail(session);
        if (email != null) userSessions.remove(email, session);
    }

    private void closeInvalidAuctionSession(WebSocketSession session) throws IOException {
        removeSession(session);
        if (session.isOpen()) session.close(CloseStatus.BAD_DATA.withReason("A valid authenticated auction session is required"));
    }
}