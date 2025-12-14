package com.sweetshop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sweets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sweet {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;
    
    @Column(length = 500)
    private String description;
    
    private String imageUrl;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum Category {
    Chocolate,
    Candy,
    Cake,
    Cookie,
    Pastry,
    Ice_Cream,
    Ladoo,
    Barfi,
    Halwa,
    Rasgulla,
    Gulab_Jamun,
    Kheer,
    Peda,
    Jalebi,
    Bengali_Sweets,
    Dry_Sweets,
    Milk_Sweets,
    Namkeen,
    Beverages,
    Bakery,
    Snacks,
    Other;

    public String getDisplayName() {
            return this.name().replace("_", " ");
        }
}

}
