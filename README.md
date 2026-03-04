# Industrial Defect Examiner

Мобильное приложение для инспектирования строительных дефектов с использованием AI на базе Google Gemini и Supabase.

## Архитектура проекта

- **Backend**: Python/FastAPI с интеграцией Google Gemini AI
- **Mobile**: React Native/Expo приложение
- **Database**: Supabase для хранения данных и изображений
- **AI**: Google Gemini 3 Flash для анализа дефектов

## Функциональность

### Основные возможности:
- Создание и управление опросами строительных объектов
- Съемка дефектов через камеру или загрузка из галереи
- AI-анализ дефектов с классификацией по ГОСТ стандартам
- Генерация отчетов в формате DOCX
- Просмотр готовых отчетов

### Категории дефектов:
- **A** - Без дефектов
- **B** - Незначительные дефекты
- **C** - Серьезные дефекты
- **D** - Критические дефекты

## Требования к установке

### Backend:
- Python 3.8+
- pip

### Mobile:
- Node.js 16+
- Expo CLI
- iOS Simulator или Android Emulator
- Физическое устройство для тестирования камеры

## Установка и запуск

### 1. Настройка Backend

```bash
# Переход в директорию бэкенда
cd backend

# Установка зависимостей
pip install -r requirements.txt

# Настройка переменных окружения
cp .env.example .env
```

Отредактируйте `.env` файл:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET_IMAGES=defect-images
SUPABASE_BUCKET_REPORTS=defect-reports
GEMINI_API_KEY=your-gemini-api-key
EXAMINER_INSTRUCTIONS=You are an expert construction examiner...
```

### 2. Настройка Supabase

1. Создайте новый проект в [Supabase](https://supabase.com)
2. В настройках проекта найдите URL и service role key
3. Создайте таблицы в базе данных:

```sql
-- Таблица опросов
CREATE TABLE surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  industry_gost TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица дефектов
CREATE TABLE defects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  axis TEXT NOT NULL CHECK (axis IN ('X', 'Y')),
  construction_type TEXT NOT NULL CHECK (construction_type IN ('Concrete', 'Brick', 'Metal', 'Roof')),
  location TEXT,
  description TEXT NOT NULL,
  status_category TEXT NOT NULL CHECK (status_category IN ('A', 'B', 'C', 'D')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX idx_surveys_user_id ON surveys(user_id);
CREATE INDEX idx_defects_survey_id ON defects(survey_id);
```

4. Создайте storage buckets:
   - `defect-images` для хранения изображений
   - `defect-reports` для хранения отчетов

### 3. Запуск Backend

```bash
# Запуск сервера разработки
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend будет доступен по адресу `http://localhost:8000`

### 4. Настройка Mobile приложения

```bash
# Переход в директорию мобильного приложения
cd mobile

# Установка зависимостей
npm install

# Установка expo-image-picker для загрузки изображений
npm install expo-image-picker
```

Отредактируйте `src/config.ts`:
```typescript
export const BACKEND_BASE_URL = "http://localhost:8000"; // или ваш серверный адрес
```

### 5. Запуск Mobile приложения

```bash
# Запуск Expo сервера
npm start

# Для iOS
npm run ios

# Для Android
npm run android

# Для веб-версии
npm run web
```

## Использование приложения

### 1. Аутентификация
- При первом запуске приложение запросит аутентификацию
- Введите demo данные или настройте реальную аутентификацию

### 2. Создание опроса
- На главном экране нажмите "+ New"
- Введите название объекта и стандарт ГОСТ
- Нажмите "Create"

### 3. Съемка дефектов
- Выберите созданный опрос
- Нажмите "Capture Defect"
- Выберите источник изображения:
  - **Take Photo** - съемка через камеру
  - **Choose from Library** - выбор из галереи
- Укажите параметры:
  - **Axis** - ось конструкции (X/Y)
  - **Construction type** - тип материала
  - **Location** - местоположение (опционально)
- Нажмите "Send to backend" для анализа

### 4. Просмотр результатов
- После анализа вы увидите результат от Gemini AI
- Статус дефекта и описание согласно ГОСТ стандартам

### 5. Генерация отчетов
- На главном экране нажмите "Reports"
- Выберите опрос для просмотра дефектов
- Нажмите "Generate" для создания DOCX отчета

## API Эндпоинты

### Backend API:
- `GET /health` - проверка работоспособности
- `POST /surveys` - создание нового опроса
- `GET /surveys?user_id={id}` - получение опросов пользователя
- `POST /defects/analyze` - анализ дефекта
- `GET /reports/{survey_id}` - генерация отчета

## Структура проекта

```
build/
├── backend/
│   ├── main.py              # FastAPI приложение
│   ├── requirements.txt     # Зависимости Python
│   ├── .env.example         # Пример конфигурации
│   └── test_connections.py  # Тест подключения
└── mobile/
    ├── src/
    │   ├── screens/         # Экраны приложения
    │   ├── navigation.tsx   # Навигация
    │   ├── theme.ts         # Тема оформления
    │   └── config.ts        # Конфигурация
    ├── App.tsx              # Главный компонент
    └── package.json         # Зависимости
```

## Ограничения Gemini API

Бесплатный тариф Gemini API имеет ограничения:
- 20 запросов в день на модель
- 1 запрос в секунду

Для коммерческого использования рекомендуется перейти на платный тариф.

## Устранение проблем

### Backend не запускается:
- Проверьте установлены ли все зависимости: `pip install -r requirements.txt`
- Проверьте корректность `.env` файла
- Убедитесь что Supabase доступен

### Mobile приложение не подключается:
- Проверьте что backend запущен и доступен
- Убедитесь что `BACKEND_BASE_URL` в `config.ts` указывает на правильный адрес
- Проверьте сетевые настройки эмулятора

### Gemini API ошибки:
- Проверьте валидность API ключа
- Проверьте лимиты запросов
- При превышении лимита подождите или используйте другой API ключ

## Разработка

### Добавление новых функций:
1. Backend - добавьте новые эндпоинты в `main.py`
2. Mobile - создайте новые экраны в `src/screens/`
3. Обновите навигацию в `navigation.tsx`

### Тестирование:
```bash
# Backend тесты
python test_connections.py

# Mobile тесты
npm test
```

## Лицензия

Проект разработан для демонстрации возможностей AI в строительной инспекции.
