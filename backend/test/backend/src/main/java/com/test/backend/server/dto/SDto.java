package com.test.backend.server.dto;

import lombok.*;

@Setter
@Getter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class SDto {
	private String message;	//파이썬의 응답 json의 키 명


	//private Map<String, String> message;	//파이썬이 중첩 JSON({"message": {"alice":"hello", "bob":"hi"}})으로 응답

	// 1. 특정 키로 직접 가져오기
	//String aliceTalk = sdto.getMessage().get("alice"); // "hello"
	//String bobTalk = sdto.getMessage().get("bob");     // "hi"

	// 2. 전체 데이터 반복해서 꺼내기 (for-each)
	//sdto.getMessage().forEach((key, value) -> {
	//	System.out.println("이름: " + key + ", 인사: " + value);
	//});
}
