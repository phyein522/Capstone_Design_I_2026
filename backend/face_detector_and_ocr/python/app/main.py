from fastapi import FastAPI
from pydantic import BaseModel  # 외부 라이브러리지만 FastAPI 설치 시 같이 깔림
import base64
import numpy as np
import cv2
import easyocr
import json

app = FastAPI()

# EasyOCR Reader 초기화
reader = easyocr.Reader(['ko', 'en'], gpu=False)

class ImgRequestDto(BaseModel):   # 반드시 (BaseModel)을 써서 상속받아야 함
    image: str

@app.post("/postimgpython")
def post_img_python(item : ImgRequestDto):
    result = ocr_from_base64(item.image)
    return result

#

def ocr_from_base64(base64_str):
    try:
        #
        # 1. Base64 문자열에서 헤더 제거 (data:image/jpeg;base64, ...)
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]

        # 2. Base64 디코딩 -> 바이트 배열 변환 -> 이미지 디코딩
        img_bytes = base64.b64decode(base64_str)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        if img is None:
            return [{"x1":-1, "y1":-1, "x2":-1, "y2":-1, "type":"error", "content":"OCR_ERROR"}] #{"error": "이미지를 디코딩할 수 없습니다."}
    
        # 4. OCR 실행
        raw_results = reader.readtext(img)

        # 5. JSON 리스트 형태로 변환
        json_result = []
        for bbox, text, conf in raw_results:
            x_coords = [p[0] for p in bbox]
            y_coords = [p[1] for p in bbox]
        
            item = {
                "x1": int(min(x_coords)),
                "y1": int(min(y_coords)),
                "x2": int(max(x_coords)),
                "y2": int(max(y_coords)),
                "type": "text",
                "content": text
            }
            json_result.append(item)

        return json_result
    except Exception as e:
        return [{"x1":-1, "y1":-1, "x2":-1, "y2":-1, "type":"error", "content": str(e)}]
