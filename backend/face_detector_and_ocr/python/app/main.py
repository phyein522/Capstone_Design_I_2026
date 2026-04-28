from fastapi import FastAPI
from pydantic import BaseModel  # 외부 라이브러리지만 FastAPI 설치 시 같이 깔림
import base64
import numpy as np
import cv2
import easyocr
import json
import urllib.request
import os

app = FastAPI()

class ImgRequestDto(BaseModel):   # 반드시 (BaseModel)을 써서 상속받아야 함
    image: str

@app.post("/postimgpython")
def post_img_python(item : ImgRequestDto):
    result = detect(item.image)
    return result

#

model_path="version-RFB-320.onnx"
def check_and_download_model():
    #AI 모델 파일이 없으면 자동으로 다운로드
    if not os.path.exists(model_path):
        url = "https://github.com/Linzaer/Ultra-Light-Fast-Generic-Face-Detector-1MB/raw/master/models/onnx/version-RFB-320.onnx"
        try:
            urllib.request.urlretrieve(url, model_path)
        except Exception as e:
            print(f"[Error] 다운로드 실패: {e}")
check_and_download_model()
reader = easyocr.Reader(['ko', 'en'], gpu=False)
face_net = cv2.dnn.readNetFromONNX(model_path)

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
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        
        if img is None:
            return [{"x1":-1, "y1":-1, "x2":-1, "y2":-1, "type":"error", "content":"ERROR"}]
        
        h, w, _ = img.shape
        final_json = []
        
        # 1. 얼굴 인식 (Face Detection)
        blob = cv2.dnn.blobFromImage(cv2.resize(img, (320, 240)), 1/127.5, (320, 240), 127.5)
        face_net.setInput(blob)
        outs = face_net.forward(face_net.getUnconnectedOutLayersNames())
        
        if outs[0].shape[-1] == 4:
            boxes, scores = np.squeeze(outs[0]), np.squeeze(outs[1])
        else:
            scores, boxes = np.squeeze(outs[0]), np.squeeze(outs[1])
        
        face_count = 1
        
        for i in range(len(scores)):
            score = scores[i][1] if len(scores.shape) > 1 else scores[i]
            if score > 0.8:
                box = boxes[i]
                x1, y1, x2, y2 = int(box[0]*w), int(box[1]*h), int(box[2]*w), int(box[3]*h)
                final_json.append({
                    "x1": max(0, x1)
                    , "y1": max(0, y1)
                    , "x2": min(w, x2)
                    , "y2": min(h, y2)
                    , "type": "face"
                    , "content": f"얼굴{face_count}"
                })
                face_count += 1
                break
        
        # 2. 텍스트 인식 (EasyOCR)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        ocr_results = reader.readtext(gray)
        
        for (bbox, text, prob) in ocr_results:
            if prob > 0.3:
                x1, y1 = int(bbox[0][0]), int(bbox[0][1])
                x2, y2 = int(bbox[2][0]), int(bbox[2][1])
                final_json.append({
                    "x1": x1
                    , "y1": y1
                    , "x2": x2
                    , "y2": y2
                    , "type": "text"
                    , "content": text
                })
        
        return final_json
    except Exception as e:
        return [{"x1":-1, "y1":-1, "x2":-1, "y2":-1, "type":"error", "content": str(e)}]
