# Capstone_Design_I_2026
2026년 &nbsp;&nbsp; 캡스톤디자인I &nbsp;&nbsp; 4조

<hr>

- 2024671027 박혜인 (팀장)
- 2024671019 남도훈
- 2024671055 임지현

<hr>

- 초경량 고속 범용 얼굴 인식기 <br>
https://github.com/Linzaer/Ultra-Light-Fast-Generic-Face-Detector-1MB

- easyOCR <br>
https://github.com/JaidedAI/EasyOCR

<hr>

4주차
- 주제 변경: (임시 프로젝트명)마스킷(mask-it)-얼굴인식 및 OCR을 이용한 개인정보 스캔 및 마스킹 웹
- git hub repository 생성
- Bootstrap css 디자인 결정 (Bootswatch - Minty, https://bootswatch.com/minty/)

<br>

5주차
- 팀원 변경: 4명 -> 3명
- 팅장 변경: 2024671027 박혜인
- 역할 분담
	- 백엔드: 박혜인
	- 프론트엔드: 임지현
	- ai: 남도훈

<br>

6주차
- 역할 별 요구사항
	- python<br>
result = {<br>
&nbsp;&nbsp;&nbsp;&nbsp;{<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"x1":"시작x좌표"<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;, "y1":"시작y좌표"<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;, "x2":"끝x좌표"<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;, "y2":"끝y좌표"<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;, "type":"face"&nbsp;&nbsp;&nbsp;&nbsp;#얼굴 인식일 시<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;, "content":"얼굴"&nbsp;&nbsp;&nbsp;&nbsp;#JSON 형식 통일을 위해 넣음<br>
&nbsp;&nbsp;&nbsp;&nbsp;}<br>
&nbsp;&nbsp;&nbsp;&nbsp;, {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"x1":"시작x좌표"<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;, "y1":"시작y좌표"<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;, "x2":"끝x좌표"<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;, "y2":"끝y좌표"<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;, "type":"text"&nbsp;&nbsp;&nbsp;&nbsp;#OCR 텍스트 일시<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;, "content":"텍스트"&nbsp;&nbsp;&nbsp;&nbsp;#OCR이 인식한 텍스트의 내용을 담아야 하나, 현재는 임시로 "텍스트"라는 문자열을 담음<br>
&nbsp;&nbsp;&nbsp;&nbsp;}<br>
&nbsp;&nbsp;&nbsp;&nbsp;, ...<br>
}<br>
print(result)&nbsp;&nbsp;&nbsp;&nbsp;#결과가 요구하는 형태인지 확인
	- 프론트엔드
<img src="./md_img/요구사항 - 프론트엔드.png" />
	- 백엔드
		1. 프론트엔드가 업로드한 이미지를 python에 전달
		2. python이 응답한 JSON(좌표, type, content)을 프론트엔드에 전달
		3. 프론트엔드가 체크박스에 체크 시, 해당 좌표에 마스킹

<br>

7주차
- 중간 결과 발표 준비

<br>

8주차
- 중간 결과 발표

<hr>