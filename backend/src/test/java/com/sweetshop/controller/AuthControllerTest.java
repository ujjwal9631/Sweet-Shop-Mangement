package com.sweetshop.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sweetshop.dto.*;
import com.sweetshop.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private UserRepository userRepository;
    
    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }
    
    @Test
    void shouldRegisterNewUserSuccessfully() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("test@example.com")
                .password("password123")
                .name("Test User")
                .build();
        
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("User registered successfully"))
                .andExpect(jsonPath("$.user.email").value("test@example.com"))
                .andExpect(jsonPath("$.user.name").value("Test User"))
                .andExpect(jsonPath("$.user.role").value("user"))
                .andExpect(jsonPath("$.token").exists());
    }
    
    @Test
    void shouldReturn400ForDuplicateEmail() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("duplicate@example.com")
                .password("password123")
                .name("Test User")
                .build();
        
        // First registration
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));
        
        // Second registration with same email
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("User with this email already exists"));
    }
    
    @Test
    void shouldReturn400ForInvalidEmail() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("invalid-email")
                .password("password123")
                .name("Test User")
                .build();
        
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }
    
    @Test
    void shouldReturn400ForShortPassword() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("test@example.com")
                .password("123")
                .name("Test User")
                .build();
        
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }
    
    @Test
    void shouldRegisterAdminUser() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("admin@example.com")
                .password("password123")
                .name("Admin User")
                .role("admin")
                .build();
        
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.role").value("admin"));
    }
    
    @Test
    void shouldLoginSuccessfully() throws Exception {
        // Register user first
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email("login@example.com")
                .password("password123")
                .name("Login User")
                .build();
        
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)));
        
        // Login
        LoginRequest loginRequest = LoginRequest.builder()
                .email("login@example.com")
                .password("password123")
                .build();
        
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.token").exists());
    }
    
    @Test
    void shouldReturn401ForInvalidCredentials() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("nonexistent@example.com")
                .password("wrongpassword")
                .build();
        
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }
    
    @Test
    void shouldGetProfileWithValidToken() throws Exception {
        // Register and get token
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email("profile@example.com")
                .password("password123")
                .name("Profile User")
                .build();
        
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andReturn();
        
        AuthResponse authResponse = objectMapper.readValue(
                result.getResponse().getContentAsString(), AuthResponse.class);
        
        // Get profile
        mockMvc.perform(get("/api/auth/profile")
                        .header("Authorization", "Bearer " + authResponse.getToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value("profile@example.com"));
    }
    
    @Test
    void shouldReturn401WithoutToken() throws Exception {
        mockMvc.perform(get("/api/auth/profile"))
                .andExpect(status().isUnauthorized());
    }
}
