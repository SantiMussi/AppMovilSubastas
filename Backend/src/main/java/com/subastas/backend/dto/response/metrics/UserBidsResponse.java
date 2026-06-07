package com.subastas.backend.dto.response.metrics;

import lombok.Data;
import java.util.List;

@Data
public class UserBidsResponse {
    private String status;
    private String message;
    private List<BidItemDto> items;
}
