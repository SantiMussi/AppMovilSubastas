package com.subastas.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReseteoContraseñaResponse {

    private Boolean success;
    private String message;
    private DevPushNotification pushNotification;

    @Data
    @Builder
    public static class DevPushNotification {
        private String title;
        private String body;
        private String code;
    }
}