package com.marsking.mars_king.models.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MaskingRequestDto {
    private String image;
    private List<PositionDto> positions;
}
