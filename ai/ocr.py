import os
import json
import cv2
import easyocr
from ultralytics import YOLO

class SuperPrivacyDetector:
    def __init__(self):
        # 웹 서버 백엔드에서 로그를 추적할 수 있도록 시스템 프린트 유지
        print("[System] 초고성능 AI 탐지 엔진 초기화 중 (YOLOv8 + EasyOCR 웹 연동형)...")
        
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_name = "yolov8n_100e.pt"
        model_path = os.path.join(current_dir, model_name)
        
        self.face_model = YOLO(model_path)
        self.ocr_reader = easyocr.Reader(['ko', 'en'], gpu=False)
        print("[System] 모든 고성능 엔진이 로드되었습니다.\n")

    def detect(self, image_path):
        image = cv2.imread(image_path)
        if image is None:
            return {"error": f"이미지를 읽을 수 없습니다: {image_path}"}

        h, w, _ = image.shape
        final_json = []

        # 1. YOLOv8 얼굴 인식
        face_results = self.face_model(image, imgsz=640, conf=0.4, iou=0.45, verbose=False)[0]
        for i, box in enumerate(face_results.boxes):
            xyxy = box.xyxy[0].tolist()
            x1, y1, x2, y2 = int(xyxy[0]), int(xyxy[1]), int(xyxy[2]), int(xyxy[3])
            
            face_data = {
                "x1": max(0, x1), "y1": max(0, y1), "x2": min(w, x2), "y2": min(h, y2),
                "type": "face", "content": f"Face_{i+1}"
            }
            final_json.append(face_data)

        # 2. EasyOCR 텍스트 정밀 탐지
        ocr_results = self.ocr_reader.readtext(
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

        # 웹 사이트 백엔드(JSP, Node.js 등)가 파싱할 수 있도록 최종 JSON 배열 데이터만 깔끔하게 반환
        return final_json

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 웹 서버에 저장될 업로드 이미지 경로를 예시로 매핑
    image_name = "test_id.png" 
    full_path = os.path.join(current_dir, image_name)

    if os.path.exists(full_path):
        detector = SuperPrivacyDetector()
        results = detector.detect(full_path)
        
        print(json.dumps(results, ensure_ascii=False, indent=4))
    else:
        print(json.dumps({"error": "파일을 찾을 수 없습니다."}, ensure_ascii=False))
