# 🐳 Docker Deployment for Vertex AI

## 🎯 Готовые Docker файлы для вашего сервера:

### ✅ Что создано:
1. **`Dockerfile.vertex`** - оптимизированный для Vertex AI
2. **`docker-compose.vertex.yml`** - с Vertex AI конфигурацией
3. **`deploy_vertex_ai.sh`** - автоматическое развертывание

## 🚀 Развертывание на голом сервере:

### Шаг 1: Подготовка сервера
```bash
# Установить Docker (если еще не установлен)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установить Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Перезайти в систему
newgrp docker
```

### Шаг 2: Развертывание проекта
```bash
# Создать директорию проекта
sudo mkdir -p /opt/industrial-inspector
cd /opt/industrial-inspector

# Клонировать проект
git clone https://github.com/yourusername/industrial-inspector.git .

# Скопировать Docker файлы
cp production/Dockerfile.vertex Dockerfile
cp production/docker-compose.vertex.yml docker-compose.yml
cp production/deploy_vertex_ai.sh deploy.sh

# Сделать исполняемым
chmod +x deploy.sh
```

### Шаг 3: Конфигурация окружения
```bash
# Создать .env.production
cat > .env.production << EOF
# Supabase Configuration
SUPABASE_URL=https://ienrlqnjfnoimuuoxmpp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllbnJscW5qZm5vaW11dW94bXBwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4NDQwOSwiZXhwIjoyMDg4MDYwNDA5fQ.A9L02dvxaaVGmgFEQQVjBCrX-PuFCLdnUjWbLdkrcQg
SUPABASE_BUCKET_IMAGES=defect-images
SUPABASE_BUCKET_REPORTS=defect-reports

# Vertex AI Configuration (ADC - no API keys needed)
PROJECT_ID=stroyka-489218
LOCATION=us-central1

# Server Configuration
BACKEND_BASE_URL=https://yourdomain.com/api
NODE_ENV=production
DAILY_LIMIT=1000

# Domain Configuration
DOMAIN_NAME=yourdomain.com
EOF
```

### Шаг 4: Запуск приложения
```bash
# Развернуть с Vertex AI
./deploy.sh production

# Или вручную:
docker-compose down
docker-compose build
docker-compose up -d
```

## 🔍 Проверка развертывания:

### Health Checks:
```bash
# Проверить бэкенд
curl -f http://localhost:8000/api/health

# Проверить Vertex AI
docker exec industrial-inspector_backend_1 python -c "
from vertexai.generative_models import GenerativeModel
import vertexai
vertexai.init(project='stroyka-489218', location='us-central1')
model = GenerativeModel('gemini-2.0-flash-preview')
print('Vertex AI working in container')
"

# Проверить логи
docker logs industrial-inspector_backend_1
docker logs industrial-inspector_nginx_1
```

## 🎯 Преимущества Docker с Vertex AI:

### ✅ Безопасность:
- **Нет API ключей в коде** - использует ADC
- **Изолированная среда** - контейнеризация
- **Контроль версий** - Docker образы

### ✅ Масштабируемость:
- **Горизонтальное масштабирование** - docker-compose scale
- **Load balancing** - Nginx reverse proxy
- **Кеширование** - Redis контейнер

### ✅ Мониторинг:
- **Health checks** - автоматические проверки
- **Логирование** - централизованное
- **Бэкапы** - автоматические

## 🌐 Конфигурация для продакшена:

### Nginx (включен в docker-compose):
- **SSL терминирование** - автоматическое
- **Rate limiting** - защита от DDoS
- **Static files** - кеширование
- **Reverse proxy** - на бэкенд

### Redis (кеширование):
- **Session storage** - быстрые сессии
- **API responses** - кеширование запросов
- **Rate limiting** - контроль лимитов

## 📱 Интеграция с мобильным приложением:

### API Endpoints (доступны извне):
```bash
# Базовый URL: https://yourdomain.com/api
POST /api/defects/analyze  # Vertex AI анализ
GET  /api/surveys          # Опросы пользователя
GET  /api/defects/{id}     # Дефекты опроса
POST /api/reports/{id}       # Генерация отчетов
```

### Мобильное приложение:
```typescript
// Обновить конфигурацию в mobile/src/config.ts
export const BACKEND_BASE_URL = "https://yourdomain.com/api";

// Vertex AI будет работать автоматически
// Никаких изменений в мобильном приложении не нужно!
```

## 🚨 Поиск неисправностей:

### Если контейнеры не запускаются:
```bash
# Проверить Docker
docker --version
docker-compose --version

# Проверить логи
docker-compose logs

# Проверить права доступа
ls -la /var/run/docker.sock
```

### Если Vertex AI не работает:
```bash
# Проверить ADC в контейнере
docker exec industrial-inspector_backend_1 gcloud auth list

# Проверить проект
docker exec industrial-inspector_backend_1 gcloud config list

# Проверить квоты
docker exec industrial-inspector_backend_1 gcloud logging read
```

### Если Supabase не подключается:
```bash
# Проверить переменные окружения
docker exec industrial-inspector_backend_1 env | grep SUPABASE

# Проверить соединение
docker exec industrial-inspector_backend_1 python -c "
import httpx
try:
    r = httpx.get('https://ienrlqnjfnoimuuoxmpp.supabase.co/rest/v1/')
    print(f'Supabase status: {r.status_code}')
except Exception as e:
    print(f'Supabase error: {e}')
"
```

## 🎉 Готово к продакшену!

### Что будет работать:
1. **✅ Vertex AI интеграция** - без API ключей
2. **✅ Docker контейнеры** - изолированная среда
3. **✅ Nginx reverse proxy** - SSL и оптимизация
4. **✅ Redis кеширование** - производительность
5. **✅ Автоматические бэкапы** - надежность
6. **✅ Health monitoring** - отслеживание состояния

### Следующие шаги:
1. **Купить домен** и настроить DNS
2. **Развернуть** на сервере с помощью Docker
3. **Настроить SSL** (автоматически через Let's Encrypt)
4. **Протестировать** мобильное приложение
5. **Запустить iOS разработку** с готовым бэкендом

**Ваш Vertex AI сервер готов к продакшену!** 🚀
