package com.sweetshop.service;

import com.sweetshop.dto.*;
import com.sweetshop.entity.Sweet;
import com.sweetshop.repository.SweetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SweetService {
    
    private final SweetRepository sweetRepository;
    
    @Transactional
    public SweetResponse createSweet(SweetRequest request) {
        if (sweetRepository.existsByName(request.getName())) {
            throw new RuntimeException("A sweet with this name already exists");
        }
        
        Sweet sweet = Sweet.builder()
                .name(request.getName())
                .category(request.getCategory())
                .price(request.getPrice())
                .quantity(request.getQuantity() != null ? request.getQuantity() : 0)
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .build();
        
        Sweet savedSweet = sweetRepository.save(sweet);
        
        return SweetResponse.builder()
                .message("Sweet created successfully")
                .sweet(SweetDto.fromEntity(savedSweet))
                .build();
    }
    
    public SweetListResponse getAllSweets(int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Page<Sweet> sweetPage = sweetRepository.findAll(pageable);
        
        return buildListResponse(sweetPage, page, limit);
    }
    
    public SweetDto getSweetById(Long id) {
        Sweet sweet = sweetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sweet not found"));
        return SweetDto.fromEntity(sweet);
    }
    
    public SweetListResponse searchSweets(String name, String category, BigDecimal minPrice, BigDecimal maxPrice, int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        
        Sweet.Category categoryEnum = null;
        if (category != null && !category.isEmpty()) {
            try {
                categoryEnum = Sweet.Category.valueOf(category.replace(" ", "_"));
            } catch (IllegalArgumentException e) {
                // Invalid category, will return empty results
            }
        }
        
        Page<Sweet> sweetPage = sweetRepository.searchSweets(
                name != null && !name.isEmpty() ? name : null,
                categoryEnum,
                minPrice,
                maxPrice,
                pageable
        );
        
        return buildListResponse(sweetPage, page, limit);
    }
    
    @Transactional
    public SweetResponse updateSweet(Long id, SweetRequest request) {
        Sweet sweet = sweetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sweet not found"));
        
        if (request.getName() != null && !request.getName().equals(sweet.getName())) {
            if (sweetRepository.existsByName(request.getName())) {
                throw new RuntimeException("A sweet with this name already exists");
            }
            sweet.setName(request.getName());
        }
        
        if (request.getCategory() != null) {
            sweet.setCategory(request.getCategory());
        }
        if (request.getPrice() != null) {
            sweet.setPrice(request.getPrice());
        }
        if (request.getQuantity() != null) {
            sweet.setQuantity(request.getQuantity());
        }
        if (request.getDescription() != null) {
            sweet.setDescription(request.getDescription());
        }
        if (request.getImageUrl() != null) {
            sweet.setImageUrl(request.getImageUrl());
        }
        
        Sweet savedSweet = sweetRepository.save(sweet);
        
        return SweetResponse.builder()
                .message("Sweet updated successfully")
                .sweet(SweetDto.fromEntity(savedSweet))
                .build();
    }
    
    @Transactional
    public void deleteSweet(Long id) {
        Sweet sweet = sweetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sweet not found"));
        sweetRepository.delete(sweet);
    }
    
    @Transactional
    public PurchaseResponse purchaseSweet(Long id, Integer quantity) {
        if (quantity == null || quantity < 1) {
            throw new RuntimeException("Quantity must be at least 1");
        }
        
        Sweet sweet = sweetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sweet not found"));
        
        if (sweet.getQuantity() < quantity) {
            throw new InsufficientStockException("Insufficient stock", sweet.getQuantity());
        }
        
        sweet.setQuantity(sweet.getQuantity() - quantity);
        Sweet savedSweet = sweetRepository.save(sweet);
        
        return PurchaseResponse.builder()
                .message("Purchase successful")
                .sweet(SweetDto.fromEntity(savedSweet))
                .purchased(quantity)
                .build();
    }
    
    @Transactional
    public RestockResponse restockSweet(Long id, Integer quantity) {
        if (quantity == null || quantity < 1) {
            throw new RuntimeException("Quantity must be at least 1");
        }
        
        Sweet sweet = sweetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sweet not found"));
        
        sweet.setQuantity(sweet.getQuantity() + quantity);
        Sweet savedSweet = sweetRepository.save(sweet);
        
        return RestockResponse.builder()
                .message("Restock successful")
                .sweet(SweetDto.fromEntity(savedSweet))
                .added(quantity)
                .build();
    }
    
    private SweetListResponse buildListResponse(Page<Sweet> sweetPage, int page, int limit) {
        List<SweetDto> sweetDtos = sweetPage.getContent().stream()
                .map(SweetDto::fromEntity)
                .collect(Collectors.toList());
        
        PaginationDto pagination = PaginationDto.builder()
                .page(page)
                .limit(limit)
                .total(sweetPage.getTotalElements())
                .pages(sweetPage.getTotalPages())
                .build();
        
        return SweetListResponse.builder()
                .sweets(sweetDtos)
                .pagination(pagination)
                .build();
    }
    
    public static class InsufficientStockException extends RuntimeException {
        private final int available;
        
        public InsufficientStockException(String message, int available) {
            super(message);
            this.available = available;
        }
        
        public int getAvailable() {
            return available;
        }
    }
}
