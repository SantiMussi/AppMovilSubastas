package com.subastas.backend.controller;

import com.subastas.backend.dto.request.CreateProposalRequest;
import com.subastas.backend.dto.request.ProposalTermsRequest;
import com.subastas.backend.dto.response.CreateProposalResponse;
import com.subastas.backend.dto.response.ProposalDetailResponse;
import com.subastas.backend.dto.response.ProposalListResponse;
import com.subastas.backend.dto.response.ProposalTermsResponse;
import com.subastas.backend.service.ProposalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class ProposalController {

    private final ProposalService proposalService;

    @PostMapping("/proposals")
    public ResponseEntity<CreateProposalResponse> create(@Valid @RequestBody CreateProposalRequest request, Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(proposalService.create(request, principal.getName()));
    }

    @GetMapping("/users/me/proposals")
    public ResponseEntity<ProposalListResponse> mine(Principal principal) {
        return ResponseEntity.ok(proposalService.listMine(principal.getName()));
    }

    @GetMapping("/proposals/{proposalId}")
    public ResponseEntity<ProposalDetailResponse> detail(@PathVariable Integer proposalId, Principal principal) {
        return ResponseEntity.ok(proposalService.getMine(proposalId, principal.getName()));
    }

    @PatchMapping("/proposals/{proposalId}/terms")
    public ResponseEntity<ProposalTermsResponse> terms(@PathVariable Integer proposalId,
                                                       @Valid @RequestBody ProposalTermsRequest request,
                                                       Principal principal) {
        return ResponseEntity.ok(proposalService.respondTerms(proposalId, request, principal.getName()));
    }

    @GetMapping("/sales/me/proposals/{proposalId}")
    public ResponseEntity<ProposalDetailResponse> saleResult(@PathVariable Integer proposalId, Principal principal) {
        return ResponseEntity.ok(proposalService.getMine(proposalId, principal.getName()));
    }
}