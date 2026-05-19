package com.subastas.backend.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class BidHistoryResponse {
    private List<BidHistoryItemResponse> items;
}