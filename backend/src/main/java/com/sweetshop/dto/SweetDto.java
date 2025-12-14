package com.sweetshop.dto;

import com.sweetshop.entity.Sweet;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SweetDto {
    private Long id;
    private String name;
    private String category;
    private BigDecimal price;
    private Integer quantity;
    private String description;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static SweetDto fromEntity(Sweet sweet) {
        return SweetDto.builder()
                .id(sweet.getId())
                .name(sweet.getName())
                .category(sweet.getCategory().getDisplayName())
                .price(sweet.getPrice())
                .quantity(sweet.getQuantity())
                .description(sweet.getDescription())
                .imageUrl(sweet.getImageUrl())
                .createdAt(sweet.getCreatedAt())
                .updatedAt(sweet.getUpdatedAt())
                .build();
    }
}
