package com.subastas.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.CONFLICT, reason = "Fecha límite de multa sobrepasada")
public class MultaVencidaException extends Exception {
}
