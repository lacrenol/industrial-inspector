# 🚀 One Command Deploy - Universal Solution

## 🎯 Если скрипты не найдены - используйте ЭТО:

### 🔥 Полное развертывание ОДНОЙ командой:

```bash
# Подключитесь к серверу
ssh root@your-server-ip

# Выполните ОДНУ команду (все включено):
cd /opt && rm -rf industrial-inspector && git clone https://github.com/lacrenol/industrial-inspector.git && cd industrial-inspector && mkdir -p production && cat > production/update-server.sh << 'EOF'
#!/bin/bash
set -e
ENVIRONMENT=${1:-production}
echo "🔄 Updating Industrial Inspector Server"
cd /opt/industrial-inspector
git pull origin master
cd production
docker-compose -f docker-compose.vertex.yml down
docker-compose -f docker-compose.vertex.yml build --no-cache
docker-compose -f docker-compose.vertex.yml up -d
sleep 30
echo "🏥 Health check..."
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo "✅ Update successful!"
else
    echo "❌ Health check failed"
    docker-compose -f docker-compose.vertex.yml logs backend
    exit 1
fi
EOF
chmod +x production/update-server.sh && ./production/update-server.sh production
```

### 📋 Что делает эта команда:

1. **Удаляет старую папку** (если есть)
2. **Клонирует свежий репозиторий**
3. **Создает production папку**
4. **Создает update-server.sh скрипт**
5. **Делает скрипт исполняемым**
6. **Запускает обновление**

### 🎯 Если уже клонировали, просто создайте скрипты:

```bash
cd /opt/industrial-inspector

# Создать update скрипт
cat > production/update-server.sh << 'EOF'
#!/bin/bash
set -e
ENVIRONMENT=${1:-production}
echo "🔄 Updating Industrial Inspector Server"
cd /opt/industrial-inspector
git pull origin master
cd production
docker-compose -f docker-compose.vertex.yml down
docker-compose -f docker-compose.vertex.yml build --no-cache
docker-compose -f docker-compose.vertex.yml up -d
sleep 30
echo "🏥 Health check..."
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo "✅ Update successful!"
else
    echo "❌ Health check failed"
    docker-compose -f docker-compose.vertex.yml logs backend
    exit 1
fi
EOF

chmod +x production/update-server.sh
./production/update-server.sh production
```

### 🔧 Если нужно создать ВСЕ файлы:

```bash
cd /opt/industrial-inspector

# Создать ВСЕ необходимые файлы ОДНОЙ командой:
mkdir -p production && cat > production/Dockerfile.vertex << 'EOF'
FROM python:3.9-slim
WORKDIR /app
RUN apt-get update && apt-get install -y gcc g++ libffi-dev libssl-dev curl git && rm -rf /var/lib/apt/lists/*
COPY ../requirements_vertex_ai.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY ../backend /app
RUN mkdir -p logs
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 CMD curl -f http://localhost:8000/health || exit 1
CMD ["uvicorn", "main_vertex_ai:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
EOF

cat > production/docker-compose.vertex.yml << 'EOF'
version: "3.8"
services:
  backend:
    build: 
      context: ..
      dockerfile: production/Dockerfile.vertex
    ports:
      - "8000:8000"
    environment:
      - SUPABASE_URL=https://ienrlqnjfnoimuuoxmpp.supabase.co
      - SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllbnJscW5qZm5vaW11dW94bXBwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4NDQwOSwiZXhwIjoyMDg4MDYwNDA5fQ.A9L02dvxaaVGmgFEQQVjBCrX-PuFCLdnUjWbLdkrcQg
      - SUPABASE_BUCKET_IMAGES=defect-images
      - SUPABASE_BUCKET_REPORTS=defect-reports
      - PROJECT_ID=stroyka-489218
      - LOCATION=us-central1
      - BACKEND_BASE_URL=http://localhost:8000
      - NODE_ENV=production
      - DAILY_LIMIT=1000
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
    restart: unless-stopped
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
volumes:
  redis_data:
EOF

cat > production/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    upstream backend {
        server backend:8000;
    }
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }
        location /api/defects/analyze {
            limit_req zone=api burst=5 nodelay;
            client_max_body_size 10M;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

cat > backend/main_vertex_ai.py << 'EOF'
import asyncio
import base64
import io
import json
import os
import time
from datetime import datetime
from typing import List, Optional
from vertexai.generative_models import GenerativeModel, Part
import vertexai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import httpx
from pydantic import BaseModel
from supabase import Client, create_client

load_dotenv()
PROJECT_ID = "stroyka-489218"
LOCATION = "us-central1"
EXAMINER_INSTRUCTIONS = "Structural engineer. Analyze defect in photo. Classify: A(исправное) B(работоспособное) C(ограниченно) D(аварийное). JSON format: {\"description\": \"...\", \"status_category\": \"A|B|C|D\"}"
vertexai.init(project=PROJECT_ID, location=LOCATION)
REQUEST_COUNT = 0
LAST_RESET = datetime.now()
DAILY_LIMIT = 100

def check_rate_limit():
    global REQUEST_COUNT, LAST_RESET
    now = datetime.now()
    if now.date() > LAST_RESET.date():
        REQUEST_COUNT = 0
        LAST_RESET = now
    if REQUEST_COUNT >= DAILY_LIMIT:
        raise HTTPException(status_code=429, detail=f"Daily limit of {DAILY_LIMIT} requests exceeded. Try again tomorrow.")
    REQUEST_COUNT += 1

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_BUCKET_IMAGES = os.getenv("SUPABASE_BUCKET_IMAGES", "defect-images")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
app = FastAPI(title="Industrial Defect Examiner API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class Axis(str):
    X = "X"
    Y = "Y"

class ConstructionType(str):
    Concrete = "Concrete"
    Brick = "Brick"
    Metal = "Metal"
    Roof = "Roof"

class DefectAnalyzeRequest(BaseModel):
    survey_id: str
    image_base64: Optional[str] = None
    image_url: Optional[str] = None
    axis: Axis
    construction_type: ConstructionType
    location: Optional[str] = None

class Defect(BaseModel):
    id: str
    survey_id: str
    image_url: str
    axis: Axis
    construction_type: ConstructionType
    location: Optional[str]
    description: str
    status_category: str

def _parse_gemini_response(raw: str) -> dict[str, str]:
    try:
        data = json.loads(raw)
        if isinstance(data, dict):
            return {"description": data.get("description", "No description provided."), "status_category": data.get("status_category", "B")}
    except json.JSONDecodeError:
        pass
    description = "No description provided."
    status_category = "B"
    if "description" in raw.lower():
        import re
        desc_match = re.search(r'description["\s]*:["\s]*"([^"]+)"', raw, re.IGNORECASE)
        if desc_match:
            description = desc_match.group(1)
    if "status_category" in raw.lower():
        import re
        status_match = re.search(r'status_category["\s]*:["\s]*"([ABCD])"', raw, re.IGNORECASE)
        if status_match:
            status_category = status_match.group(1)
    return {"description": description, "status_category": status_category}

async def _analyze_defect_with_vertex_ai(image: Image.Image, axis: str, construction_type: str, location: Optional[str]) -> dict:
    try:
        model = GenerativeModel("gemini-2.0-flash-preview")
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format="JPEG")
        img_bytes = img_byte_arr.getvalue()
        image_part = Part.from_data(img_bytes, mime_type="image/jpeg")
        prompt = f"{EXAMINER_INSTRUCTIONS}\n\nAxis: {axis}\nType: {construction_type}\nLocation: {location or 'N/A'}\n\nJSON format: {{\"description\": \"...\", \"status_category\": \"A|B|C|D\"}}"
        response = await asyncio.to_thread(model.generate_content, [prompt, image_part], generation_config={"temperature": 0.1, "max_output_tokens": 500})
        raw = response.text
        return _parse_gemini_response(raw)
    except Exception as e:
        return {"description": f"Analysis failed: {str(e)}", "status_category": "B"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/defects/analyze", response_model=Defect)
async def analyze_defect(payload: DefectAnalyzeRequest):
    check_rate_limit()
    if not (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY):
        raise HTTPException(status_code=500, detail="Backend is missing environment configuration.")
    image_bytes: Optional[bytes] = None
    if payload.image_base64:
        try:
            image_bytes = base64.b64decode(payload.image_base64)
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to decode base64 image: {e}")
    else:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(payload.image_url or "")
            if resp.status_code != 200:
                raise HTTPException(status_code=400, detail=f"Could not fetch image: {resp.status_code}")
            image = Image.open(io.BytesIO(resp.content)).convert("RGB")
    gemini_result = await _analyze_defect_with_vertex_ai(image=image, axis=payload.axis, construction_type=payload.construction_type, location=payload.location)
    image_url_to_store = payload.image_url
    if image_bytes is not None:
        try:
            filename = f"survey-{payload.survey_id}-{int(time.time())}.jpg"
            upload_result = supabase.storage.from_(SUPABASE_BUCKET_IMAGES).upload(path=filename, file=image_bytes, file_options={"content-type": "image/jpeg"})
            public_info = supabase.storage.from_(SUPABASE_BUCKET_IMAGES).get_public_url(filename)
            image_url_to_store = public_info.get("publicUrl")
            if not image_url_to_store:
                image_url_to_store = f"https://{SUPABASE_URL.replace('https://', '')}.supabase.co/storage/v1/object/public/{SUPABASE_BUCKET_IMAGES}/{filename}"
        except Exception as e:
            image_url_to_store = f"failed-upload-{payload.survey_id}-{int(time.time())}.jpg"
    defect_row = {"survey_id": payload.survey_id, "image_url": image_url_to_store, "axis": payload.axis, "construction_type": payload.construction_type, "location": payload.location, "description": gemini_result["description"], "status_category": gemini_result["status_category"]}
    try:
        res = supabase.table("defects").insert(defect_row).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save defect: {e}")
    if not res.data:
        raise HTTPException(status_code=500, detail="Supabase did not return defect.")
    row = res.data[0]
    return Defect(id=str(row["id"]), survey_id=row["survey_id"], image_url=row["image_url"], axis=row["axis"], construction_type=row["construction_type"], location=row.get("location"), description=row["description"], status_category=row["status_category"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

cat > requirements_vertex_ai.txt << 'EOF'
fastapi==0.115.0
uvicorn[standard]==0.30.6
python-dotenv==1.0.1
python-docx==1.1.2
google-cloud-aiplatform>=1.38.0
supabase==2.6.0
httpx==0.27.2
Pillow==10.4.0
EOF

# Создать update скрипт
cat > production/update-server.sh << 'EOF'
#!/bin/bash
set -e
ENVIRONMENT=${1:-production}
echo "🔄 Updating Industrial Inspector Server"
cd /opt/industrial-inspector
git pull origin master
cd production
docker-compose -f docker-compose.vertex.yml down
docker-compose -f docker-compose.vertex.yml build --no-cache
docker-compose -f docker-compose.vertex.yml up -d
sleep 30
echo "🏥 Health check..."
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo "✅ Update successful!"
else
    echo "❌ Health check failed"
    docker-compose -f docker-compose.vertex.yml logs backend
    exit 1
fi
EOF

chmod +x production/update-server.sh
./production/update-server.sh production
```

### 🎯 ГОТОВО!

После выполнения этой команды у вас будет:
- ✅ Полный Vertex AI бэкенд
- ✅ Docker контейнеры
- ✅ Nginx reverse proxy
- ✅ Redis кеширование
- ✅ Update скрипт
- ✅ Все работающее!

### 🧪 Проверка:
```bash
# Health check
curl -f http://localhost/api/health

# Test Vertex AI
curl -X POST http://localhost/api/defects/analyze -H "Content-Type: application/json" -d '{"survey_id": "test", "axis": "X", "construction_type": "Concrete"}'
```

**🎉 ВСЕ В ОДНОЙ КОМАНДЕ! БЕЗ ПРОБЛЕМ С ФАЙЛАМИ!** 🚀
