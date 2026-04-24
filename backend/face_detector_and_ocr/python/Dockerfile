FROM python:3.10.11-slim

RUN apt-get update && apt-get install -y libgl1-mesa-glx libglib2.0-0 g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /code

# 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir -r requirements.txt

# 소스 코드 복사
COPY . .

# 실행 명령어 (app 폴더 안의 main.py 내 app 객체 실행)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]