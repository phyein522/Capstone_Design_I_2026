package com.test.backend.server.service;

import com.test.backend.server.dto.SDto;
import com.test.backend.server.dto.SRequestDto;
import com.test.backend.server.dto.SResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SService {
	@Autowired
	private IPythonClient pythonClient;

	public SDto postPython(SRequestDto requestDto) {
		return this.pythonClient.postPython(requestDto);
	}
}
