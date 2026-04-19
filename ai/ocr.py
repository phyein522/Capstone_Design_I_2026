import os
import cv2
import numpy as np
import json
import easyocr
import urllib.request

class PrivacyDetector:
    def __init__(self, model_path="version-RFB-320.onnx"):
        self.model_path = model_path
        self.check_and_download_model()
        
        print("[System] 탐지 엔진 초기화 중 (CPU 모드)...")
        # 어떤 컴퓨터에서도 돌아가도록 gpu=False로 설정했습니다.
        self.reader = easyocr.Reader(['ko', 'en'], gpu=False)
        self.face_net = cv2.dnn.readNetFromONNX(self.model_path)
        print("[System] 모든 준비가 완료되었습니다.")

    def check_and_download_model(self):
        """AI 모델 파일이 없으면 자동으로 다운로드합니다."""
        if not os.path.exists(self.model_path):
            print(f"[Network] 모델 파일이 없습니다. 다운로드를 시작합니다...")
            url = "https://github.com/Linzaer/Ultra-Light-Fast-Generic-Face-Detector-1MB/raw/master/models/onnx/version-RFB-320.onnx"
            try:
                urllib.request.urlretrieve(url, self.model_path)
                print("[Network] 모델 다운로드 완료.")
            except Exception as e:
                print(f"[Error] 다운로드 실패: {e}")

    def detect(self, img_path):
        """이미지에서 얼굴과 텍스트를 찾아 좌표를 반환합니다."""
        img = cv2.imread(img_path)
        if img is None:
            return {"status": "error", "message": f"파일을 읽을 수 없습니다. 경로를 확인하세요: {img_path}"}

        h, w, _ = img.shape
        final_json = []

        # 1. 얼굴 인식 (Face Detection)
        blob = cv2.dnn.blobFromImage(cv2.resize(img, (320, 240)), 1/127.5, (320, 240), 127.5)
        self.face_net.setInput(blob)
        outs = self.face_net.forward(self.face_net.getUnconnectedOutLayersNames())

        if outs[0].shape[-1] == 4:
            boxes, scores = np.squeeze(outs[0]), np.squeeze(outs[1])
        else:
            scores, boxes = np.squeeze(outs[0]), np.squeeze(outs[1])

        for i in range(len(scores)):
            score = scores[i][1] if len(scores.shape) > 1 else scores[i]
            if score > 0.8:
                box = boxes[i]
                x1, y1, x2, y2 = int(box[0]*w), int(box[1]*h), int(box[2]*w), int(box[3]*h)
                final_json.append({
                    "x1": max(0, x1), "y1": max(0, y1),
                    "x2": min(w, x2), "y2": min(h, y2),
                    "type": "face", "content": "얼굴"
                })
                break

        # 2. 텍스트 인식 (EasyOCR)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        ocr_results = self.reader.readtext(gray)

        for (bbox, text, prob) in ocr_results:
            if prob > 0.3:
                x1, y1 = int(bbox[0][0]), int(bbox[0][1])
                x2, y2 = int(bbox[2][0]), int(bbox[2][1])
                final_json.append({
                    "x1": x1, "y1": y1, "x2": x2, "y2": y2,
                    "type": "text", "content": text
                })

        return final_json

# --- 실행부 ---
if __name__ == "__main__":
    detector = PrivacyDetector()
    
    # [중요] 사진 파일이 ocr.py와 같은 폴더에 있어야 합니다!
    my_image = "test_id.png" 
    
    # 현재 파일의 경로를 기준으로 사진을 찾도록 보강
    base_path = os.path.dirname(__file__)
    full_path = os.path.join(base_path, my_image)
    
    if os.path.exists(full_path):
        results = detector.detect(full_path)
        print("\n" + "="*50)
        print("[AI 분석 결과 JSON 데이터]")
        print(json.dumps(results, ensure_ascii=False, indent=4))
        print("="*50)
    else:
        print(f"\n[알림] '{my_image}' 파일을 찾을 수 없습니다.")