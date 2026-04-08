from fastapi import FastAPI
from pydantic import BaseModel  # 외부 라이브러리지만 FastAPI 설치 시 같이 깔림

app = FastAPI()

class SRequestDto(BaseModel):   # 반드시 (BaseModel)을 써서 상속받아야 함
    content: str

@app.get("/python")
def read_root():
    return {"message": "Python 3.10.11 in Docker with Compose! - get"}

@app.post("/analyze")
def analyze(item : SRequestDto):
    return {"message": f"Python 3.10.11 in Docker with Compose! - post: {item.content}"}
