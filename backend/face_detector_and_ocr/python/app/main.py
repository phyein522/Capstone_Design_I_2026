from fastapi import FastAPI
from pydantic import BaseModel  # 외부 라이브러리지만 FastAPI 설치 시 같이 깔림
import base64
import numpy as np
import cv2
import easyocr
import json
import urllib.request
import os
from ultralytics import YOLO

app = FastAPI()

class ImgRequestDto(BaseModel):   # 반드시 (BaseModel)을 써서 상속받아야 함
    image: str

@app.post("/postimgpython")
def post_img_python(item : ImgRequestDto):
    result = detect(item.image)
    return result

current_dir = os.path.dirname(os.path.abspath(__file__))
model_name = "yolov8n_100e.pt"
model_path = os.path.join(current_dir, model_name)
face_model = YOLO(model_path)
ocr_reader = easyocr.Reader(['ko', 'en'], gpu=False)

def detect(base64_str):
    try:
        # Base64 문자열에서 헤더 제거 (data:image/jpeg;base64, ...)
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
        # base64 → bytes
        img_bytes = base64.b64decode(base64_str)
        # bytes → numpy array
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        # numpy array → OpenCV 이미지
        image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        
        if image is None:
            return [{"x1":-1, "y1":-1, "x2":-1, "y2":-1, "type":"error", "content":"ERROR"}]
        
        h, w, _ = image.shape
        final_json = []
        
        # 1. YOLOv8 얼굴 인식
        face_results = face_model(image, imgsz=640, conf=0.4, iou=0.45, verbose=False)[0]
        for i, box in enumerate(face_results.boxes):
            xyxy = box.xyxy[0].tolist()
            x1, y1, x2, y2 = int(xyxy[0]), int(xyxy[1]), int(xyxy[2]), int(xyxy[3])
            
            face_data = {
                "x1": max(0, x1), "y1": max(0, y1), "x2": min(w, x2), "y2": min(h, y2),
                "type": "face", "content": f"Face_{i+1}"
            }
            final_json.append(face_data)
        
        # 2. EasyOCR 텍스트 정밀 탐지
        ocr_results = ocr_reader.readtext(
            image, 
            decoder='greedy', 
            beamWidth=10,            
            contrast_ths=0.05,      
            adjust_contrast=0.7,    
            text_threshold=0.15,    
            low_text=0.3,           
            min_size=3,             
            width_ths=0.8,          
            slope_ths=0.3,          
            ycenter_ths=0.3,        
            paragraph=False
        )

        for (bbox, text, prob) in ocr_results:
            if prob > 0.05:
                x1, y1 = int(bbox[0][0]), int(bbox[0][1])
                x2, y2 = int(bbox[2][0]), int(bbox[2][1])
                
                text_str = str(text).strip()
                
                if len(text_str) <= 1 and not text_str.isdigit() and not (44032 <= ord(text_str[0]) <= 55203):
                    continue

                text_data = {
                    "x1": max(0, x1), "y1": max(0, y1), "x2": min(w, x2), "y2": min(h, y2),
                    "type": "text", "content": text_str
                }
                final_json.append(text_data)
        
        return final_json
    except Exception as e:
        return [{"x1":-1, "y1":-1, "x2":-1, "y2":-1, "type":"error", "content": str(e)}]
