package com.sweetshop.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sweetshop.dto.*;
import com.sweetshop.entity.Sweet;
import com.sweetshop.entity.User;
import com.sweetshop.repository.SweetRepository;
import com.sweetshop.repository.UserRepository;
import com.sweetshop.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SweetControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private SweetRepository sweetRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    private String userToken;
    private String adminToken;
    
    @BeforeEach
    void setUp() {
        sweetRepository.deleteAll();
        userRepository.deleteAll();
        
        // Create regular user
        User user = User.builder()
                .email("user@example.com")
                .password(passwordEncoder.encode("password123"))
                .name("Regular User")
                .role(User.Role.USER)
                .build();
        user = userRepository.save(user);
        userToken = jwtUtil.generateToken(user, user.getId(), "user");
        
        // Create admin user
        User admin = User.builder()
                .email("admin@example.com")
                .password(passwordEncoder.encode("password123"))
                .name("Admin User")
                .role(User.Role.ADMIN)
                .build();
        admin = userRepository.save(admin);
        adminToken = jwtUtil.generateToken(admin, admin.getId(), "admin");
    }
    
    @Test
    void shouldCreateSweetSuccessfully() throws Exception {
        SweetRequest request = SweetRequest.builder()
                .name("Chocolate Bar")
                .category(Sweet.Category.Chocolate)
                .price(new BigDecimal("2.99"))
                .quantity(100)
                .description("Delicious milk chocolate bar")
                .build();
        
        mockMvc.perform(post("/api/sweets")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Sweet created successfully"))
                .andExpect(jsonPath("$.sweet.name").value("Chocolate Bar"))
                .andExpect(jsonPath("$.sweet.category").value("Chocolate"));
    }
    
    @Test
    void shouldReturn400ForDuplicateSweetName() throws Exception {
        // Create first sweet
        Sweet sweet = Sweet.builder()
                .name("Unique Candy")
                .category(Sweet.Category.Candy)
                .price(new BigDecimal("1.99"))
                .quantity(50)
                .build();
        sweetRepository.save(sweet);
        
        // Try to create duplicate
        SweetRequest request = SweetRequest.builder()
                .name("Unique Candy")
                .category(Sweet.Category.Candy)
                .price(new BigDecimal("1.99"))
                .quantity(50)
                .build();
        
        mockMvc.perform(post("/api/sweets")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("A sweet with this name already exists"));
    }
    
    @Test
    void shouldReturn401WithoutAuthentication() throws Exception {
        SweetRequest request = SweetRequest.builder()
                .name("Test Sweet")
                .category(Sweet.Category.Candy)
                .price(new BigDecimal("1.99"))
                .build();
        
        mockMvc.perform(post("/api/sweets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
    
    @Test
    void shouldReturnAllSweets() throws Exception {
        // Create test sweets
        createTestSweet("Chocolate Truffle", Sweet.Category.Chocolate, "3.99", 50);
        createTestSweet("Gummy Bears", Sweet.Category.Candy, "2.49", 100);
        createTestSweet("Vanilla Cake", Sweet.Category.Cake, "15.99", 10);
        
        mockMvc.perform(get("/api/sweets")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sweets.length()").value(3))
                .andExpect(jsonPath("$.pagination").exists());
    }
    
    @Test
    void shouldSearchByName() throws Exception {
        createTestSweet("Dark Chocolate", Sweet.Category.Chocolate, "4.99", 30);
        createTestSweet("Milk Chocolate", Sweet.Category.Chocolate, "3.99", 50);
        createTestSweet("Strawberry Candy", Sweet.Category.Candy, "1.99", 100);
        
        mockMvc.perform(get("/api/sweets/search")
                        .header("Authorization", "Bearer " + userToken)
                        .param("name", "chocolate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sweets.length()").value(2));
    }
    
    @Test
    void shouldSearchByCategory() throws Exception {
        createTestSweet("Dark Chocolate", Sweet.Category.Chocolate, "4.99", 30);
        createTestSweet("Milk Chocolate", Sweet.Category.Chocolate, "3.99", 50);
        createTestSweet("Strawberry Candy", Sweet.Category.Candy, "1.99", 100);
        
        mockMvc.perform(get("/api/sweets/search")
                        .header("Authorization", "Bearer " + userToken)
                        .param("category", "Chocolate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sweets.length()").value(2));
    }
    
    @Test
    void shouldGetSweetById() throws Exception {
        Sweet sweet = createTestSweet("Test Sweet", Sweet.Category.Candy, "2.99", 50);
        
        mockMvc.perform(get("/api/sweets/" + sweet.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sweet.name").value("Test Sweet"));
    }
    
    @Test
    void shouldReturn404ForNonExistentSweet() throws Exception {
        mockMvc.perform(get("/api/sweets/99999")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Sweet not found"));
    }
    
    @Test
    void shouldUpdateSweetSuccessfully() throws Exception {
        Sweet sweet = createTestSweet("Original Sweet", Sweet.Category.Candy, "2.99", 50);
        
        SweetRequest updateRequest = SweetRequest.builder()
                .name("Updated Sweet")
                .price(new BigDecimal("3.99"))
                .build();
        
        mockMvc.perform(put("/api/sweets/" + sweet.getId())
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Sweet updated successfully"))
                .andExpect(jsonPath("$.sweet.name").value("Updated Sweet"));
    }
    
    @Test
    void shouldDeleteSweetAsAdmin() throws Exception {
        Sweet sweet = createTestSweet("Delete Test", Sweet.Category.Candy, "2.99", 50);
        
        mockMvc.perform(delete("/api/sweets/" + sweet.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Sweet deleted successfully"));
    }
    
    @Test
    void shouldReturn403ForNonAdminDelete() throws Exception {
        Sweet sweet = createTestSweet("Delete Test", Sweet.Category.Candy, "2.99", 50);
        
        mockMvc.perform(delete("/api/sweets/" + sweet.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }
    
    @Test
    void shouldPurchaseSweetSuccessfully() throws Exception {
        Sweet sweet = createTestSweet("Purchase Test", Sweet.Category.Candy, "2.99", 10);
        
        QuantityRequest request = QuantityRequest.builder()
                .quantity(3)
                .build();
        
        mockMvc.perform(post("/api/sweets/" + sweet.getId() + "/purchase")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Purchase successful"))
                .andExpect(jsonPath("$.sweet.quantity").value(7))
                .andExpect(jsonPath("$.purchased").value(3));
    }
    
    @Test
    void shouldReturn400ForInsufficientStock() throws Exception {
        Sweet sweet = createTestSweet("Low Stock", Sweet.Category.Candy, "2.99", 5);
        
        QuantityRequest request = QuantityRequest.builder()
                .quantity(10)
                .build();
        
        mockMvc.perform(post("/api/sweets/" + sweet.getId() + "/purchase")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Insufficient stock"))
                .andExpect(jsonPath("$.available").value(5));
    }
    
    @Test
    void shouldRestockSweetAsAdmin() throws Exception {
        Sweet sweet = createTestSweet("Restock Test", Sweet.Category.Candy, "2.99", 10);
        
        QuantityRequest request = QuantityRequest.builder()
                .quantity(50)
                .build();
        
        mockMvc.perform(post("/api/sweets/" + sweet.getId() + "/restock")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Restock successful"))
                .andExpect(jsonPath("$.sweet.quantity").value(60))
                .andExpect(jsonPath("$.added").value(50));
    }
    
    @Test
    void shouldReturn403ForNonAdminRestock() throws Exception {
        Sweet sweet = createTestSweet("Restock Test", Sweet.Category.Candy, "2.99", 10);
        
        QuantityRequest request = QuantityRequest.builder()
                .quantity(50)
                .build();
        
        mockMvc.perform(post("/api/sweets/" + sweet.getId() + "/restock")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
    
    private Sweet createTestSweet(String name, Sweet.Category category, String price, int quantity) {
        Sweet sweet = Sweet.builder()
                .name(name)
                .category(category)
                .price(new BigDecimal(price))
                .quantity(quantity)
                .build();
        return sweetRepository.save(sweet);
    }
}
