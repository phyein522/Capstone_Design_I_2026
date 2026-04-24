package com.marsking.mars_king.models.service;

import com.marsking.mars_king.models.dto.ImgRequestDto;
import com.marsking.mars_king.models.dto.MaskingDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "pythonClient", url = "http://localhost:8000")
public interface PythonClient {
    @PostMapping("/postimgpython")    // /api/postimg로 들어온 데이터를 /postimg로 python에 보냄
	List<MaskingDto> postPython(@RequestBody ImgRequestDto imgRequestDto);
}