package com.sweetshop.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuantityRequest {
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
}
