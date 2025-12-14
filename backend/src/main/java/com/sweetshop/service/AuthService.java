package com.sweetshop.service;

import com.sweetshop.dto.*;
import com.sweetshop.entity.User;
import com.sweetshop.repository.UserRepository;
import com.sweetshop.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User with this email already exists");
        }
        
        User.Role role = User.Role.USER;
        if (request.getRole() != null && request.getRole().equalsIgnoreCase("admin")) {
            role = User.Role.ADMIN;
        }
        
        User user = User.builder()
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role(role)
                .build();
        
        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser, savedUser.getId(), savedUser.getRole().name().toLowerCase());
        
        return AuthResponse.builder()
                .message("User registered successfully")
                .user(mapToDto(savedUser))
                .token(token)
                .build();
    }
    
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        
        String token = jwtUtil.generateToken(user, user.getId(), user.getRole().name().toLowerCase());
        
        return AuthResponse.builder()
                .message("Login successful")
                .user(mapToDto(user))
                .token(token)
                .build();
    }
    
    public UserDto getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDto(user);
    }
    
    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name().toLowerCase())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
