# 🚀 Git Repository Setup & Deployment Guide

## 📋 Что отправляем в репозиторий:

### ✅ Файлы готовые к коммиту:
1. **Backend с Vertex AI:**
   - `backend/main_vertex_ai.py` - основной бэкенд
   - `backend/requirements_vertex_ai.txt` - зависимости
   - `backend/.env.example` - шаблон конфига

2. **Docker конфигурация:**
   - `production/Dockerfile.vertex` - Docker образ
   - `production/docker-compose.vertex.yml` - инфраструктура
   - `production/deploy_vertex_ai.sh` - скрипт деплоя
   - `production/nginx.conf` - Nginx конфиг

3. **Мобильное приложение:**
   - `mobile/` - вся папка с React Native
   - `mobile/src/config.ts` - конфигурация API

4. **Документация:**
   - `DOCKER_DEPLOY_STEPS.md` - инструкции
   - `vertex_ai_integration.md` - гайд по Vertex AI

## 🎯 Шаг 1: Создание репозитория

### Если еще нет репозитория:
```bash
# 1. Зайдите на GitHub/GitLab
# 2. Создайте новый репозиторий: industrial-inspector
# 3. Выберите Public или Private
# 4. Скопируйте URL репозитория
```

### Если репозиторий уже есть:
```bash
# Просто используйте существующий URL
git remote -v  # Посмотреть текущие remote
```

## 🎯 Шаг 2: Подготовка к коммиту

### Создайте .gitignore:
```bash
cat > .gitignore << EOF
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual Environment
myenv/
venv/
env/
ENV/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Environment
.env
.env.local
.env.production
.env.staging

# Docker
.dockerignore

# Node.js (mobile)
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Expo
.expo/
dist/
web-build/

# Temporary
*.tmp
*.temp
EOF
```

### Создайте README.md:
```bash
cat > README.md << EOF
# Industrial Defect Inspector

🏗️ Приложение для инспекции строительных дефектов с AI

## 🚀 Features
- 📸 Фотофиксация дефектов
- 🤖 AI анализ через Vertex AI (Gemini 2.0 Flash)
- 📊 Генерация отчетов
- 📱 Кроссплатформенность (iOS, Android, Web)
- ☁️ Облачное хранение (Supabase)

## 🛠️ Tech Stack
- **Backend**: FastAPI + Vertex AI + Supabase
- **Mobile**: React Native + Expo
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Deployment**: Docker + Nginx

## 🚀 Quick Start

### Backend:
```bash
cd backend
docker-compose -f production/docker-compose.vertex.yml up -d
```

### Mobile:
```bash
cd mobile
npx expo start
```

## 📖 Documentation
- [Deployment Guide](DOCKER_DEPLOY_STEPS.md)
- [Vertex AI Integration](vertex_ai_integration.md)
- [API Documentation](docs/api.md)

## 🔐 Environment Variables
Скопируйте `.env.example` в `.env` и заполните:
- `SUPABASE_URL` - URL Supabase проекта
- `SUPABASE_SERVICE_ROLE_KEY` - Service role ключ
- `PROJECT_ID` - Google Cloud project ID
- `LOCATION` - Google Cloud region
EOF
```

## 🎯 Шаг 3: Инициализация Git и коммиты

### Инициализация (если новый репозиторий):
```bash
# Перейдите в корень проекта
cd /path/to/industrial-inspector

# Инициализируйте Git
git init

# Добавьте remote (замените на ваш URL)
git remote add origin https://github.com/yourusername/industrial-inspector.git

# Добавьте все файлы
git add .

# Первый коммит
git commit -m "🎉 Initial commit: Industrial Defect Inspector with Vertex AI

Features:
- ✅ Vertex AI integration (Gemini 2.0 Flash)
- ✅ Docker production setup
- ✅ Supabase integration
- ✅ React Native mobile app
- ✅ Cross-platform support
- ✅ Rate limiting and monitoring

🐳 Docker containers:
- Backend with Vertex AI
- Nginx reverse proxy
- Redis caching
- SSL termination

📱 Mobile app:
- Camera integration
- Photo upload
- Real-time sync
- Offline support

🔧 Ready for production deployment"

# Отправьте в репозиторий
git push -u origin main
```

### Если репозиторий уже существует:
```bash
# Добавьте remote (если еще не добавлен)
git remote add origin https://github.com/yourusername/industrial-inspector.git

# Получите изменения
git pull origin main

# Добавьте новые файлы
git add .
git add production/
git add backend/main_vertex_ai.py
git add backend/requirements_vertex_ai.txt
git add DOCKER_DEPLOY_STEPS.md
git add vertex_ai_integration.md

# Коммит с описанием изменений
git commit -m "🚀 Production-ready Vertex AI integration

Major changes:
- ✅ Migrated from Gemini API to Vertex AI
- ✅ Added ADC authentication (no API keys)
- ✅ Updated Docker configuration for production
- ✅ Added deployment scripts and documentation
- ✅ Optimized for Google Cloud stroyka-489218 project

🐳 Infrastructure updates:
- New Dockerfile.vertex for Vertex AI
- Updated docker-compose.vertex.yml
- Added SSL and nginx configuration
- Redis caching layer
- Health monitoring

📚 Documentation:
- Complete deployment guide
- Vertex AI integration instructions
- Docker setup for bare metal servers

🔧 Configuration:
- Project: stroyka-489218
- Region: us-central1
- Model: gemini-2.0-flash-preview
- Auth: ADC (Application Default Credentials)"

# Отправьте изменения
git push origin main
```

## 🎯 Шаг 4: Проверка репозитория

### После отправки проверьте:
```bash
# Откройте репозиторий в браузере
# https://github.com/yourusername/industrial-inspector

# Проверьте что все файлы на месте
ls -la
git status
git log --oneline -5
```

## 🎯 Шаг 5: Развертывание на сервере

### Подключитесь к серверу:
```bash
ssh root@your-server-ip
```

### Скачайте и развертывайте:
```bash
# Создайте директорию
mkdir -p /opt/industrial-inspector
cd /opt/industrial-inspector

# Клонируйте репозиторий
git clone https://github.com/yourusername/industrial-inspector.git .

# Перейдите в production папку
cd production

# Сделайте деплой скрипт исполняемым
chmod +x deploy_vertex_ai.sh

# Создайте .env.production
cp .env.example .env.production
nano .env.production  # Отредактируйте!
```

### Запустите развертывание:
```bash
# Автоматический деплой
./deploy_vertex_ai.sh production

# Или вручную
docker-compose -f docker-compose.vertex.yml --env-file .env.production up -d
```

## 📋 Структура репозитория:

```
industrial-inspector/
├── README.md                    # Описание проекта
├── .gitignore                   # Исключения Git
├── backend/                      # Backend код
│   ├── main_vertex_ai.py         # Основной бэкенд
│   ├── requirements_vertex_ai.txt  # Зависимости
│   └── .env.example            # Шаблон конфига
├── mobile/                       # React Native приложение
│   ├── src/
│   ├── App.tsx
│   └── package.json
├── production/                   # Production конфиги
│   ├── Dockerfile.vertex          # Docker образ
│   ├── docker-compose.vertex.yml  # Инфраструктура
│   ├── nginx.conf               # Nginx конфиг
│   └── deploy_vertex_ai.sh       # Скрипт деплоя
├── DOCKER_DEPLOY_STEPS.md        # Инструкции
├── vertex_ai_integration.md      # Vertex AI гайд
└── GIT_PUSH_GUIDE.md            # Этот файл
```

## 🎯 Что куда вводить:

### 1. В .env.production на сервере:
```bash
# Откройте файл
nano /opt/industrial-inspector/production/.env.production

# Заполните эти переменные:
SUPABASE_URL=https://ienrlqnjfnoimuuoxmpp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_BUCKET_IMAGES=defect-images
SUPABASE_BUCKET_REPORTS=defect-reports

# Vertex AI (эти уже встроены в код)
PROJECT_ID=stroyka-489218
LOCATION=us-central1

# Серверные настройки
BACKEND_BASE_URL=https://yourdomain.com/api
DOMAIN_NAME=yourdomain.com
```

### 2. В nginx.conf:
```bash
# Замените yourdomain.com на ваш домен
nano /opt/industrial-inspector/production/nginx.conf

# Измените строки:
server_name yourdomain.com www.yourdomain.com;
```

### 3. В мобильном приложении:
```bash
# Обновите URL бэкенда
nano mobile/src/config.ts

# Замените строку:
export const BACKEND_BASE_URL = "https://yourdomain.com/api";
```

## 🚀 Проверка после развертывания:

### Health checks:
```bash
# Проверьте бэкенд
curl -f https://yourdomain.com/api/health

# Проверьте фронтенд
curl -f https://yourdomain.com/health

# Проверьте Vertex AI
curl -X POST https://yourdomain.com/api/defects/analyze \
  -H "Content-Type: application/json" \
  -d '{"survey_id": "test", "axis": "X", "construction_type": "Concrete"}'
```

### Логи:
```bash
# Логи бэкенда
docker logs industrial-inspector_backend_1

# Логи Nginx
docker logs industrial-inspector_nginx_1

# Статус контейнеров
docker ps
docker-compose ps
```

## 🎉 Готово!

После выполнения этих шагов у вас будет:
1. ✅ **Репозиторий с полным кодом**
2. ✅ **Production-ready Docker конфигурация**
3. ✅ **Vertex AI интеграция** без API ключей
4. ✅ **Автоматический деплой** через скрипты
5. ✅ **Полная документация** для поддержки

**Ваш проект готов к продакшену и командной работе!** 🚀
