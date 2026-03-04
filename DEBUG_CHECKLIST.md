# Debug Checklist - Industrial Defect Examiner

## ✅ Backend Status
- Running on: http://localhost:8000
- Health check: ✅ PASS
- Supabase connection: ✅ Configured

## 🔧 Mobile App Configuration
- Backend URL: http://localhost:8000 ✅ FIXED
- Supabase URL: https://ienrlqnjfnoimuuoxmpp.supabase.co
- Gemini API: Configured

## 🚀 Запуск и тестирование:

### 1. Backend должен быть запущен:
```powershell
cd C:\Users\vonova\Desktop\build\backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Mobile app:
```powershell
cd C:\Users\vonova\Desktop\build\mobile
npx expo start
```

### 3. Тестирование в Expo:
1. Откройте Expo Go на телефоне
2. Отсканируйте QR код
3. Откройте консоль разработчика в Expo
4. Попробуйте войти (демо-режим)

## 📱 Что должно работать:

### AuthScreen:
- Кнопка "Enter Demo Mode" → переход на Surveys
- В консоли: "Demo authentication successful, navigating to Surveys"

### SurveyListScreen:
- Показывает демо-данные или реальные данные с backend
- Кнопки "+ New" и "Reports"
- В консоли: логи загрузки опросов

### NewSurveyScreen:
- Заполнение полей и кнопка "Create"
- В консоли: логи создания опроса

### ReportsScreen:
- Показывает список опросов
- Раскрывает дефекты при клике
- Кнопка генерации отчета

## 🐛 Если ничего не работает:

### Проверьте:
1. **Backend запущен?** Откройте http://localhost:8000/health
2. **Mobile app видит backend?** Проверьте консоль Expo
3. **Network ошибки?** Проверьте firewall
4. **Expo Go версия?** Обновите приложение

### Логи для проверки:
```javascript
// В консоли Expo должно быть:
"Demo authentication successful, navigating to Surveys"
"Loading surveys for user: demo-user-123"
"Surveys response status: 200"
```

## 🔍 Отладочные шаги:

1. **Проверить backend:**
   ```powershell
   Invoke-WebRequest -Uri http://localhost:8000/health -UseBasicParsing
   ```

2. **Проверить mobile connection:**
   - Откройте Expo DevTools
   - Посмотрите Network вкладку
   - Ищите запросы к localhost:8000

3. **Проверить console logs:**
   - В Expo Go: встряхните телефон → Open Debugger
   - Или используйте Expo DevTools в браузере

## 📝 Следующие шаги:

1. Запустите backend
2. Запустите mobile app  
3. Проверьте консоль на наличие ошибок
4. Попробуйте войти через демо-режим
5. Проверьте создание опроса
6. Проверьте отчеты

Если все еще не работает - пришлите скриншот консоли Expo!
