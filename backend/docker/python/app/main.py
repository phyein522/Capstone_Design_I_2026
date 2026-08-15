import base64
import os
import cv2
import easyocr
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from ultralytics import YOLO


app = FastAPI()


class ImgRequestDto(BaseModel):
    image: str


current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "yolov8n_100e.pt")

if not os.path.exists(model_path):
    raise FileNotFoundError(f"YOLO model not found: {model_path}")

face_model = YOLO(model_path)
ocr_reader = easyocr.Reader(["ko", "en"], gpu=False)


@app.post("/postimgpython")
def post_img_python(item: ImgRequestDto):
    return detect(item.image)


def detect(base64_str: str):
    try:
        if "," in base64_str:
            base64_str = base64_str.split(",", 1)[1]

        img_bytes = base64.b64decode(base64_str)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        if image is None:
            return [error_response("Invalid image")]

        h, w, _ = image.shape
        final_json = []

        face_results = face_model(
            image,
            imgsz=640,
            conf=0.4,
            iou=0.45,
            verbose=False,
        )[0]

        for i, box in enumerate(face_results.boxes):
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())

            final_json.append({
                "x1": max(0, x1),
                "y1": max(0, y1),
                "x2": min(w, x2),
                "y2": min(h, y2),
                "type": "face",
                "content": f"Face_{i + 1}",
            })

        ocr_results = ocr_reader.readtext(
            image,
            decoder="greedy",
            beamWidth=10,
            contrast_ths=0.05,
            adjust_contrast=0.7,
            text_threshold=0.15,
            low_text=0.3,
            min_size=3,
            width_ths=0.8,
            slope_ths=0.3,
            ycenter_ths=0.3,
            paragraph=False,
        )

        for bbox, text, prob in ocr_results:
            if prob <= 0.05:
                continue

            text_str = str(text).strip()
            if not text_str:
                continue

            if (
                len(text_str) <= 1
                and not text_str.isdigit()
                and not (44032 <= ord(text_str[0]) <= 55203)
            ):
                continue

            x1, y1 = int(bbox[0][0]), int(bbox[0][1])
            x2, y2 = int(bbox[2][0]), int(bbox[2][1])

            final_json.append({
                "x1": max(0, x1),
                "y1": max(0, y1),
                "x2": min(w, x2),
                "y2": min(h, y2),
                "type": "text",
                "content": text_str,
            })

        return final_json

    except Exception as e:
        return [error_response(str(e))]


def error_response(message: str):
    return {
        "x1": -1,
        "y1": -1,
        "x2": -1,
        "y2": -1,
        "type": "error",
        "content": message,
    }
