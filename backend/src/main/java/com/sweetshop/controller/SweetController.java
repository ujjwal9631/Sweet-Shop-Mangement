package com.sweetshop.controller;

import com.sweetshop.dto.*;
import com.sweetshop.service.SweetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/sweets")
@RequiredArgsConstructor
public class SweetController {
    
    private final SweetService sweetService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createSweet(@Valid @RequestBody SweetRequest request) {
        try {
            SweetResponse response = sweetService.createSweet(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<SweetListResponse> getAllSweets(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        SweetListResponse response = sweetService.getAllSweets(page, limit);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/search")
    public ResponseEntity<SweetListResponse> searchSweets(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        SweetListResponse response = sweetService.searchSweets(name, category, minPrice, maxPrice, page, limit);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getSweetById(@PathVariable Long id) {
        try {
            SweetDto sweet = sweetService.getSweetById(id);
            return ResponseEntity.ok(Map.of("sweet", sweet));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSweet(@PathVariable Long id, @RequestBody SweetRequest request) {
        try {
            SweetResponse response = sweetService.updateSweet(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteSweet(@PathVariable Long id) {
        try {
            sweetService.deleteSweet(id);
            return ResponseEntity.ok(Map.of("message", "Sweet deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/purchase")
    public ResponseEntity<?> purchaseSweet(
            @PathVariable Long id,
            @RequestBody(required = false) QuantityRequest request) {
        try {
            Integer quantity = request != null && request.getQuantity() != null ? request.getQuantity() : 1;
            
            if (quantity < 1) {
                return ResponseEntity.badRequest().body(Map.of("message", "Quantity must be at least 1"));
            }
            
            PurchaseResponse response = sweetService.purchaseSweet(id, quantity);
            return ResponseEntity.ok(response);
        } catch (SweetService.InsufficientStockException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", e.getMessage(),
                    "available", e.getAvailable()
            ));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/restock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> restockSweet(
            @PathVariable Long id,
            @RequestBody QuantityRequest request) {
        try {
            if (request.getQuantity() == null || request.getQuantity() < 1) {
                return ResponseEntity.badRequest().body(Map.of("message", "Quantity must be at least 1"));
            }
            
            RestockResponse response = sweetService.restockSweet(id, request.getQuantity());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
