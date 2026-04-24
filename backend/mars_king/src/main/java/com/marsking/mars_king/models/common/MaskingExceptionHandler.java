package com.marsking.mars_king.models.common;

import com.marsking.mars_king.models.dto.MaskingResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class MaskingExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<MaskingResponseDto<String>> ExceptionHandler(Exception e) {
        MaskingResponseDto<String> response = MaskingResponseDto.<String>builder()
                .code(ResponseCode.FAIL)
                .message(e.getMessage())
                .data(e.toString())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
