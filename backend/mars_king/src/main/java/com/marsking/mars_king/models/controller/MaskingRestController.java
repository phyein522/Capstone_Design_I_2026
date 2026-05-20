package com.marsking.mars_king.models.controller;

import com.marsking.mars_king.models.common.ModeCode;
import com.marsking.mars_king.models.common.ResponseCode;
import com.marsking.mars_king.models.dto.*;
import com.marsking.mars_king.models.service.MaskingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MaskingRestController {
    @Autowired
    private MaskingService service;

    @PostMapping("/postimg")
    public ResponseEntity<MaskingResponseDto<List<MaskingDto>>> postPython(@RequestBody ImgRequestDto requestDto) {
        // 받은 데이터를 그대로 파이썬에 전달하고 응답을 반환
        List<MaskingDto> result = service.postPython(requestDto);
        return ResponseEntity.ok().body(MaskingResponseDto.make(ResponseCode.SUCCESS, "OK", result));
    }

    /*
    @PostMapping("/marskingimg")
    public ResponseEntity<MaskingResponseDto<MaskedImgDto>> maskingImage(@RequestBody MaskingRequestDto requestDto) {
        MaskedImgDto result = service.maskingImage(requestDto, ModeCode.MODE_MASKING);
        return ResponseEntity.ok().body(MaskingResponseDto.make(ResponseCode.SUCCESS, "OK", result));
    }

    @PostMapping("/printimg")
    public ResponseEntity<MaskingResponseDto<MaskedImgDto>> printImage(@RequestBody MaskingRequestDto requestDto) {
        MaskedImgDto result = service.maskingImage(requestDto, ModeCode.MODE_PRINT);
        return ResponseEntity.ok().body(MaskingResponseDto.make(ResponseCode.SUCCESS, "OK", result));
    }
    */

    @PostMapping("/test")
    public ResponseEntity<MaskingResponseDto<MaskingDto>> test() {
        MaskingDto result = new MaskingDto(1, 1, 2, 2, "text", "text");
        return ResponseEntity.ok().body(MaskingResponseDto.make(ResponseCode.SUCCESS, "OK", result));
    }
}
