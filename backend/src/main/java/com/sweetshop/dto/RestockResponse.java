package com.sweetshop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestockResponse {
    private String message;
    private SweetDto sweet;
    private Integer added;
}
