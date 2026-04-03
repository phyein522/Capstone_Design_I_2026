package com.test.backend.server.dto;

import lombok.*;

@Setter
@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class SResponseDto {
	private Integer code;
	private String message;
	private Object data;
}
