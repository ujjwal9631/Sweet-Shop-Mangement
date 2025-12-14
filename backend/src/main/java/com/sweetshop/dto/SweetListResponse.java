package com.sweetshop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SweetListResponse {
    private List<SweetDto> sweets;
    private PaginationDto pagination;
}
