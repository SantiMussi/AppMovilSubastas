package com.subastas.backend.dto.response.registro;

import com.subastas.backend.entity.Categoria;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompletarRegistroResponse {

    private String message;
    private String accessToken;
    private String refreshToken;
    private UserResponse user;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserResponse {
        private Integer id;
        private String email;
        private Categoria categoria;
    }
}