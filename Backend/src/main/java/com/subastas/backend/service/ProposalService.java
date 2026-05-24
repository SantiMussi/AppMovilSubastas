package com.subastas.backend.service;

import com.subastas.backend.dto.request.CreateProposalRequest;
import com.subastas.backend.dto.request.ProposalTermsRequest;
import com.subastas.backend.dto.response.CreateProposalResponse;
import com.subastas.backend.dto.response.ProposalDetailResponse;
import com.subastas.backend.dto.response.ProposalListResponse;
import com.subastas.backend.dto.response.ProposalTermsResponse;

public interface ProposalService {
    CreateProposalResponse create(CreateProposalRequest request, String email);
    ProposalListResponse listMine(String email);
    ProposalDetailResponse getMine(Integer proposalId, String email);
    ProposalTermsResponse respondTerms(Integer proposalId, ProposalTermsRequest request, String email);
}