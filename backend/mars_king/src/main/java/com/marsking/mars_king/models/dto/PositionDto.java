package com.marsking.mars_king.models.dto;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class PositionDto {
    private Integer x1;
    private Integer y1;
    private Integer x2;
    private Integer y2;
    private String type;
    private String content;
    private Boolean isChecked;
}
