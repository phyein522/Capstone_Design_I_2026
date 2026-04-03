package com.test.backend.server.controller;

import com.test.backend.server.dto.SDto;
import com.test.backend.server.dto.SRequestDto;
import com.test.backend.server.dto.SResponseDto;
import com.test.backend.server.service.IPythonClient;
import com.test.backend.server.service.SService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SRestController {
	@Autowired
	private SService service;

	@PostMapping("/test")
	public ResponseEntity<SResponseDto> postPython(@RequestBody SRequestDto requestDto) {
		// Postman에서 받은 데이터를 그대로 파이썬에 전달하고 응답을 반환
		try {
			SDto result = service.postPython(requestDto);
			return ResponseEntity.ok().body(new SResponseDto(0, "OK", result));
		} catch(Exception e) {
			System.err.println(e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new SResponseDto(-999, "Server Error", null));
		}
	}
}
