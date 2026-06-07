package com.subastas.backend.websocket;

import com.fasterxml.jackson.databind.json.JsonMapper;
import com.subastas.backend.dto.response.puja.PujasEnVivoSnapshotResponse;
import com.subastas.backend.service.ItemSubastaService;
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
    private final JsonMapper jsonMapper = JsonMapper.builder()
            .findAndAddModules()
            .build();
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        if (auctionItemId(session).isEmpty()) {
            closeInvalidAuctionSession(session);
            return;
        }
        sessions.put(session.getId(), session);
        sendSnapshot(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        // A client can request an immediate refresh in addition to the scheduled live feed.
        sendSnapshot(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session.getId());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        sessions.remove(session.getId());
        if (session.isOpen()) {
            session.close(CloseStatus.SERVER_ERROR);
        }
    }

    @Scheduled(fixedDelayString = "${app.auction.live-refresh-ms:2000}")
    public void broadcastSnapshots() {
        sessions.values().forEach(session -> {
            try {
                sendSnapshot(session);
            } catch (Exception exception) {
                log.debug("Unable to send auction update to session {}", session.getId(), exception);
                sessions.remove(session.getId());
            }
        });
    }

    private void sendSnapshot(WebSocketSession session) throws IOException {
        if (!session.isOpen()) {
            sessions.remove(session.getId());
            return;
        }
        Optional<Integer> auctionItemId = auctionItemId(session);
        if (auctionItemId.isEmpty()) {
            closeInvalidAuctionSession(session);
            return;
        }
        PujasEnVivoSnapshotResponse snapshot = new PujasEnVivoSnapshotResponse(
                "auction_snapshot",
                Instant.now(),
                itemSubastaService.obtenerDetalle(auctionItemId.get()),
                itemSubastaService.obtenerMejorPuja(auctionItemId.get()),
                itemSubastaService.obtenerHistorialPujas(auctionItemId.get(), 0, HISTORY_SIZE));
        synchronized (session) {
            session.sendMessage(new TextMessage(jsonMapper.writeValueAsString(snapshot)));
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

    private void closeInvalidAuctionSession(WebSocketSession session) throws IOException {
        sessions.remove(session.getId());
        log.warn("Rejecting WebSocket session {} with invalid auction item URI: {}", session.getId(), session.getUri());
        if (session.isOpen()) {
            session.close(CloseStatus.BAD_DATA.withReason("A valid auction item ID is required"));
        }
    }
}