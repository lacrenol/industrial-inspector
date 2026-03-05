# 🔄 Server Update Guide

## 🎯 Как обновить данные на сервере

### 📋 Доступные способы обновления:

#### **1. Полное обновление (рекомендуется):**
```bash
# Подключитесь к серверу
ssh root@your-server-ip

# Перейдите в проект
cd /opt/industrial-inspector

# Запустите полное обновление
./production/update-server.sh production
```

#### **2. Быстрое обновление (без пересборки):**
```bash
cd /opt/industrial-inspector
./production/quick-update.sh
```

#### **3. Ручное обновление:**
```bash
cd /opt/industrial-inspector
git pull origin master
cd production
docker-compose -f docker-compose.vertex.yml down
docker-compose -f docker-compose.vertex.yml build
docker-compose -f docker-compose.vertex.yml up -d
```

## 🔍 Что делает update-server.sh:

### ✅ Автоматически выполняет:
1. **📦 Создает бэкап** - текущие данные сохраняются
2. **📥 Загружает изменения** - git pull origin master
3. **🐳 Обновляет Docker образы** - pull последних версий
4. **🔨 Пересобирает образы** - build --no-cache
5. **🛑 Останавливает контейнеры** - down
6. **🚀 Запускает новые контейнеры** - up -d
7. **⏳ Ожидает запуска** - 30 секунд
8. **🏥 Проверяет здоровье** - health checks
9. **🧪 Тестирует Vertex AI** - проверка AI
10. **📝 Логирует обновление** - запись в лог

## 🚨 Безопасность:

### ✅ Автоматические бэкапы:
```bash
# Бэкапы создаются в:
/var/backups/industrial-inspector/production-YYYYMMDD-HHMMSS/

# Redis данные сохраняются
# Docker контейнеры сохраняются
# Конфигурации сохраняются
```

### ✅ Откат изменений:
```bash
# Если что-то пошло не так:
cd /var/backups/industrial-inspector/
ls -la  # Найдите последний бэкап
cp -r production-20250305-143022 /opt/industrial-inspector/production
cd /opt/industrial-inspector/production
docker-compose -f docker-compose.vertex.yml up -d
```

## 📱 Обновление мобильного приложения:

### После обновления сервера:
```typescript
// mobile/src/config.ts
export const BACKEND_BASE_URL = "http://your-server-ip:8000/api";
```

### Проверка соединения:
```bash
# Тест API
curl -f http://your-server-ip:8000/api/health

# Тест Vertex AI
curl -X POST http://your-server-ip:8000/api/defects/analyze \
  -H "Content-Type: application/json" \
  -d '{"survey_id": "test", "axis": "X", "construction_type": "Concrete"}'
```

## 🔧 Мониторинг после обновления:

### Проверка статуса:
```bash
# Статус контейнеров
docker ps

# Логи бэкенда
docker logs industrial-inspector_backend_1

# Логи Nginx
docker logs industrial-inspector_nginx_1

# Ресурсы
docker stats
```

### Проверка функциональности:
```bash
# Health check
curl -f http://localhost/api/health

# Vertex AI тест
docker-compose -f production/docker-compose.vertex.yml exec backend python -c "
from vertexai.generative_models import GenerativeModel
import vertexai
vertexai.init(project='stroyka-489218', location='us-central1')
model = GenerativeModel('gemini-2.0-flash-preview')
print('Vertex AI working')
"
```

## 📊 Логи обновлений:

### История обновлений:
```bash
# Просмотр логов
cat /var/log/industrial-inspector/updates.log

# Последние обновления
tail -f /var/log/industrial-inspector/updates.log
```

### Статистика:
```bash
# Количество обновлений
grep -c "Updated to latest version" /var/log/industrial-inspector/updates.log

# Последнее обновление
tail -1 /var/log/industrial-inspector/updates.log
```

## 🚀 Автоматизация (опционально):

### Cron для автоматических обновлений:
```bash
# Добавить в crontab для ежедневных обновлений в 3:00
sudo crontab -e

# Добавить строку:
0 3 * * * cd /opt/industrial-inspector && ./production/update-server.sh production
```

### Webhook для GitHub (продвинутый):
```bash
# Создать webhook для автоматического обновления при push
# Требует настройки GitHub webhook и endpoint на сервере
```

## 🎯 Рекомендации:

### ✅ Когда использовать полное обновление:
- Изменился backend код
- Обновились зависимости
- Изменилась Docker конфигурация
- Проблемы с работой

### ✅ Когда использовать быстрое обновление:
- Небольшие изменения в коде
- Обновление конфигурации
- Перезапуск сервисов

### ✅ Проверка после обновления:
1. Health check прошел
2. Vertex AI работает
3. Мобильное приложение подключается
4. Фото загрузка работает
5. База данных доступна

## 🆘 Поиск неисправностей:

### Если обновление не удалось:
```bash
# Проверьте логи
./production/update-server.sh production 2>&1 | tee update.log

# Проверьте Docker
systemctl status docker

# Проверьте место на диске
df -h

# Проверьте память
free -h
```

### Если контейнеры не запускаются:
```bash
# Очистите Docker
docker system prune -a

# Перезапустите Docker
systemctl restart docker

# Попробуйте снова
./production/update-server.sh production
```

**🎉 Сервер обновлен и готов к работе!**
