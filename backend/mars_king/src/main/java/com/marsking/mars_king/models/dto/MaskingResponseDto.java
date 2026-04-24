package com.marsking.mars_king.models.dto;

import com.marsking.mars_king.models.common.ResponseCode;
import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaskingResponseDto <T> {
    private ResponseCode code;
    private String message;
    private T data;

    public static <T> MaskingResponseDto<T> make(ResponseCode code, String message, T data) {
        return MaskingResponseDto.<T>builder()
                .code(code)
                .message(message)
                .data(data)
                .build();
    }
}
