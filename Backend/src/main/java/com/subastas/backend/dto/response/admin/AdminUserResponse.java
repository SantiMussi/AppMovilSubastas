package com.subastas.backend.dto.response.admin;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.subastas.backend.entity.Categoria;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminUserResponse {
    @JsonProperty("usuario_id")
    private Integer usuarioId;
    private String email;
    private String password;
    private String apellido;
    @JsonProperty("persona_id")
    private Integer personaId;
    private String documento;
    private String nombre;
    private String direccion;
    private String estado;
    private String foto;
    private ClienteData cliente;

    @Data
    @Builder
    public static class ClienteData {
        @JsonProperty("cliente_id")
        private Integer clienteId;
        private String admitido;
        private Categoria categoria;
        private PaisData pais;
        private EmpleadoData verificador;
    }

    @Data
    @Builder
    public static class PaisData {
        private Integer numero;
        private String nombre;
        private String nombreCorto;
        private String capital;
        private String nacionalidad;
        private String idiomas;
    }

    @Data
    @Builder
    public static class EmpleadoData {
        @JsonProperty("empleado_id")
        private Integer empleadoId;
        private String documento;
        private String nombre;
        private String direccion;
        private String estado;
        private String cargo;
        private String sector;
    }
}