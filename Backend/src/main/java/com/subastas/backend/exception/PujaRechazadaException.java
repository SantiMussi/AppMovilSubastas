package com.subastas.backend.exception;

public class PujaRechazadaException extends RuntimeException {
    private final String code;

    public PujaRechazadaException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}