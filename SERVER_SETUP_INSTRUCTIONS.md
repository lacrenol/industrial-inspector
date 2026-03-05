# 🖥️ Server Setup Instructions

## 🚨 Проблема: Папка production не найдена

### Причина:
Папка `production` существует в репозитории, но не скачивается на сервере.

## 🎯 Решение на сервере:

### Шаг 1: Проверьте что скачалось
```bash
# На сервере:
cd /opt/industrial-inspector
ls -la
```

### Шаг 2: Если папки production нет, создайте ее вручную:
```bash
# Создайте папку production
mkdir -p production

# Создайте необходимые файлы
cd production
```

### Шаг 3: Создайте Dockerfile.vertex
```bash
cat > Dockerfile.vertex << 'EOF'
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libffi-dev \
    libssl-dev \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY ../requirements_vertex_ai.txt requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ../backend /app

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "main_vertex_ai:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
EOF
```

### Шаг 4: Создайте docker-compose.vertex.yml
```bash
cat > docker-compose.vertex.yml << 'EOF'
version: '3.8'

services:
  backend:
    build: 
      context: ..
      dockerfile: production/Dockerfile.vertex
    ports:
      - "8000:8000"
    environment:
      # Supabase Configuration
      - SUPABASE_URL=${SUPABASE_URL:-https://ienrlqnjfnoimuuoxmpp.supabase.co}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - SUPABASE_BUCKET_IMAGES=${SUPABASE_BUCKET_IMAGES:-defect-images}
      - SUPABASE_BUCKET_REPORTS=${SUPABASE_BUCKET_REPORTS:-defect-reports}
      
      # Vertex AI Configuration (from ADC - no API keys needed)
      - PROJECT_ID=stroyka-489218
      - LOCATION=us-central1
      
      # Application Configuration
      - BACKEND_BASE_URL=${BACKEND_BASE_URL:-http://localhost:8000}
      - NODE_ENV=production
      - DAILY_LIMIT=${DAILY_LIMIT:-1000}
      
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
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
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
```

### Шаг 5: Создайте deploy_vertex_ai.sh
```bash
cat > deploy_vertex_ai.sh << 'EOF'
#!/bin/bash

# Production Deployment Script for Vertex AI
set -e

ENVIRONMENT=${1:-staging}
DOMAIN="yourdomain.com"
BACKUP_DIR="/var/backups/industrial-inspector"
LOG_DIR="/var/log/industrial-inspector"

echo "🚀 Starting Vertex AI deployment to $ENVIRONMENT environment..."

# Create backup directories
sudo mkdir -p $BACKUP_DIR
sudo mkdir -p $LOG_DIR

# Pull latest code
echo "📥 Pulling latest code..."
cd /opt/industrial-inspector
git pull origin master

# Build and deploy with Vertex AI
echo "🔨 Building and deploying with Vertex AI..."
cd production
docker-compose -f docker-compose.vertex.yml down
docker-compose -f docker-compose.vertex.yml build
docker-compose -f docker-compose.vertex.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Health checks
echo "🏥 Running health checks..."
if curl -f http://localhost/api/health; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

echo "🎉 Vertex AI deployment to $ENVIRONMENT completed successfully!"
echo "🌐 Application available at: http://localhost"
echo "🧪 Vertex AI integration: stroyka-489218/us-central1"

# Show running containers
docker ps --filter "name=industrial-inspector"

echo ""
echo "🔍 Vertex AI Status Check:"
echo "   Project: stroyka-489218"
echo "   Region: us-central1"
echo "   Model: gemini-2.0-flash-preview"
echo "   Auth: ADC (Application Default Credentials)"
echo "   No API Keys Required ✅"
EOF

# Make executable
chmod +x deploy_vertex_ai.sh
```

### Шаг 6: Создайте nginx.conf
```bash
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=upload:10m rate=2r/s;

    # Upstream backend
    upstream backend {
        server backend:8000;
    }

    # HTTP server
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;

        # API routes
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

        # File upload routes (stricter rate limiting)
        location /api/defects/analyze {
            limit_req zone=upload burst=5 nodelay;
            client_max_body_size 10M;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF
```

### Шаг 7: Создайте .env.production
```bash
cat > .env.production << 'EOF'
# Supabase Configuration
SUPABASE_URL=https://ienrlqnjfnoimuuoxmpp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllbnJscW5qZm5vaW11dW94bXBwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4NDQwOSwiZXhwIjoyMDg4MDYwNDA5fQ.A9L02dvxaaVGmgFEQQVjBCrX-PuFCLdnUjWbLdkrcQg
SUPABASE_BUCKET_IMAGES=defect-images
SUPABASE_BUCKET_REPORTS=defect-reports

# Vertex AI Configuration (ADC - no API keys needed)
PROJECT_ID=stroyka-489218
LOCATION=us-central1

# Server Configuration
BACKEND_BASE_URL=http://localhost:8000
DOMAIN_NAME=yourdomain.com
NODE_ENV=production
DAILY_LIMIT=1000
EOF
```

### Шаг 8: Запустите развертывание
```bash
# Запустите деплой
./deploy_vertex_ai.sh production

# Или вручную:
docker-compose -f docker-compose.vertex.yml up -d
```

## 🎯 Проверка работоспособности:

### Health checks:
```bash
# Проверьте бэкенд
curl -f http://localhost/api/health

# Проверьте контейнеры
docker ps
docker-compose ps

# Проверьте логи
docker logs industrial-inspector_backend_1
```

### Vertex AI тест:
```bash
# Тест Vertex AI
curl -X POST http://localhost/api/defects/analyze \
  -H "Content-Type: application/json" \
  -d '{"survey_id": "test", "axis": "X", "construction_type": "Concrete", "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="}'
```

## 🚨 Если что-то не работает:

### Проверьте Docker:
```bash
# Docker статус
systemctl status docker

# Перезапустите Docker
systemctl restart docker

# Проверьте образы
docker images
```

### Проверьте Vertex AI:
```bash
# Проверьте ADC
gcloud auth list

# Проверьте проект
gcloud config list

# Тест Vertex AI
docker exec industrial-inspector_backend_1 python -c "
from vertexai.generative_models import GenerativeModel
import vertexai
vertexai.init(project='stroyka-489218', location='us-central1')
model = GenerativeModel('gemini-2.0-flash-preview')
print('Vertex AI working in container')
"
```

## 🎉 Готово!

После выполнения этих шагов у вас будет:
1. ✅ Docker контейнеры с Vertex AI
2. ✅ Nginx reverse proxy
3. ✅ Redis кеширование
4. ✅ Автоматический деплой
5. ✅ Health monitoring

**Ваш Vertex AI сервер готов к продакшену!** 🚀
