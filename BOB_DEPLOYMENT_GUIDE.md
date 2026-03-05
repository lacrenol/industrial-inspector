# 🚀 Bob Folder Deployment Guide

## ✅ Обновления залиты на GitHub!

### 📋 Что сделано:
- ✅ Обновлен backend (Gemini API вместо Vertex AI)
- ✅ Упрощен мобильный интерфейс
- ✅ Все изменения отправлены на GitHub
- ✅ Готов к развертыванию

## 🎯 ИНСТРУКЦИИ ЗАПУСКА НА СЕРВЕРЕ:

### Шаг 1: Подключение к серверу
```bash
ssh root@your-server-ip
```

### Шаг 2: Переход в папку bob
```bash
cd /opt/bob
```

### Шаг 3: Обновление кода с GitHub
```bash
git pull origin master
```

### Шаг 4: Создание .env файла (если нет)
```bash
cd production
cat > .env << 'EOF'
# Supabase Configuration
SUPABASE_URL=https://ienrlqnjfnoimuuoxmpp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllbnJscW5qZm5vaW11dW94bXBwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4NDQwOSwiZXhwIjoyMDg4MDYwNDA5fQ.A9L02dvxaaVGmgFEQQVjBCrX-PuFCLdnUjWbLdkrcQg
SUPABASE_BUCKET_IMAGES=defect-images
SUPABASE_BUCKET_REPORTS=defect-reports

# Gemini API Key (вставьте ваш ключ)
GEMINI_API_KEY=your_gemini_api_key_here

# Backend Configuration
BACKEND_BASE_URL=http://localhost:8000
NODE_ENV=production
EOF
```

### Шаг 5: Обновление Docker (если нужно)
```bash
# Обновите Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl restart docker

# Обновите docker-compose
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### Шаг 6: Создание docker-compose.yml
```bash
# Создайте актуальный docker-compose файл
cat > docker-compose.yml << 'EOF'
version: "3.8"
services:
  backend:
    build: 
      context: ..
      dockerfile: production/Dockerfile
    ports:
      - "8000:8000"
    env_file:
      - .env
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
```

### Шаг 7: Создание Dockerfile
```bash
# Создайте Dockerfile для Gemini API
cat > ../Dockerfile << 'EOF'
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
COPY requirements.txt requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend /app

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
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
EOF
```

### Шаг 8: Создание nginx.conf
```bash
# Создайте nginx конфигурацию
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

### Шаг 9: Запуск приложения
```bash
# Остановите старые контейнеры
docker-compose down

# Соберите и запустите новые
docker-compose build --no-cache
docker-compose up -d

# Проверьте статус
docker-compose ps
```

### Шаг 10: Проверка работы
```bash
# Проверьте логи
docker-compose logs backend

# Проверьте API
curl -f http://localhost/api/health

# Тест анализа
curl -X POST http://localhost/api/defects/analyze \
  -H "Content-Type: application/json" \
  -d '{"survey_id": "test", "axis": "X", "construction_type": "Concrete", "image_url": "https://example.com/image.jpg"}'
```

## 📱 Настройка мобильного приложения

### Обновите URL в мобильном приложении:
```typescript
// mobile/src/config.ts
export const BACKEND_BASE_URL = "http://your-server-ip:8000/api";
```

### Запустите мобильное приложение:
```bash
cd mobile
npx expo start
```

## 🔄 Обновления в будущем

### Создайте скрипт обновления:
```bash
cat > update.sh << 'EOF'
#!/bin/bash
cd /opt/bob
git pull origin master
cd production
docker-compose down
docker-compose build --no-cache
docker-compose up -d
sleep 30
curl -f http://localhost/api/health
EOF

chmod +x update.sh

# Для обновления:
./update.sh
```

## 🎉 ГОТОВО!

### Что будет работать:
- ✅ Gemini API анализ дефектов
- ✅ Supabase база данных
- ✅ Docker контейнеры
- ✅ Nginx reverse proxy
- ✅ Мобильное приложение

### Доступ:
- 🌐 API: http://your-server-ip:8000/api
- 📱 Мобильное: Expo QR код
- 🔍 Health: http://your-server-ip/api/health

**ВЫПОЛНИТЕ ЭТИ ШАГИ И ВАШЕ ПРИЛОЖЕНИЕ ЗАРАБОТАЕТ!** 🚀
