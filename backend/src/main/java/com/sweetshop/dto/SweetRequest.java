package com.sweetshop.dto;

import com.sweetshop.entity.Sweet;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SweetRequest {
    
    @NotBlank(message = "Sweet name is required")
    @Size(min = 2, message = "Name must be at least 2 characters")
    private String name;
    
    @NotNull(message = "Category is required")
    private Sweet.Category category;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private BigDecimal price;
    
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    private String imageUrl;
}
