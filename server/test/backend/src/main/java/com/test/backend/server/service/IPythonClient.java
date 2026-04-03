package com.test.backend.server.service;

import com.test.backend.server.dto.SDto;
import com.test.backend.server.dto.SRequestDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "pythonClient", url = "http://localhost:8000")
public interface IPythonClient {
	// POST 요청 예시 (JSON 데이터 전송)
	@PostMapping("/analyze")
	SDto postPython(@RequestBody SRequestDto requestDto);
}
