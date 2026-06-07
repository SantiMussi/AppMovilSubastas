package com.subastas.backend.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@EnableScheduling
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final AuctionWebSocketHandler auctionWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(auctionWebSocketHandler, "/ws/auction-items/{auctionItemId}")
                .setAllowedOriginPatterns("*");
    }
}