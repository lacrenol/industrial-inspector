# Supabase Auth Setup - Включение реальной аутентификации

## Что нужно сделать в Supabase:

### 1. Включить Email/Password Auth:

1. Зайдите в ваш Supabase проект: https://ienrlqnjfnoimuuoxmpp.supabase.co
2. Перейдите в **Authentication** → **Settings**
3. Включите **Enable email confirmations** (выключите для демо)
4. Убедитесь что **Enable email signups** включено

### 2. Добавить URL редиректа:

В **Authentication** → **URL Configuration** добавьте:
- **Site URL**: `exp://192.168.1.103:8081` (для Expo Go)
- **Redirect URLs**: `exp://192.168.1.103:8081`
- **Redirect URLs**: `http://localhost:8081` (для веба)

### 3. Проверить Auth Settings:

Убедитесь что в **Authentication** → **Settings**:
- ✅ **Enable Phone Signups** - можно выключить
- ✅ **Enable Anonymous Signins** - можно выключить
- ✅ **Enable Custom OAuth** - можно выключить

### 4. Создать тестового пользователя:

1. Перейдите в **Authentication** → **Users**
2. Нажмите **Add user**
3. Создайте тестового пользователя:
   - Email: `test@example.com`
   - Password: `password123`
   - Не подтверждайте email (для демо)

### 5. Проверить RLS Policies:

Если таблицы уже созданы, убедитесь что RLS выключен или созданы правильные policies:

```sql
-- Временно выключить RLS для тестирования
ALTER TABLE surveys DISABLE ROW LEVEL SECURITY;
ALTER TABLE defects DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

## Тестирование:

### 1. Запустите приложение:
```powershell
# Backend
cd C:\Users\vonova\Desktop\build\backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Mobile
cd C:\Users\vonova\Desktop\build\mobile
npx expo start
```

### 2. Войдите в приложении:
- Email: `test@example.com`
- Password: `password123`

### 3. Создайте опрос:
- Нажмите "+ New"
- Введите название и ГОСТ
- Нажмите "Create"

### 4. Сделайте фото дефекта:
- Выберите опрос
- Нажмите "Capture Defect"
- Сделайте фото или выберите из галереи
- Заполните параметры
- Нажмите "Send to backend"

### 5. Проверьте Supabase:
1. Откройте Supabase проект
2. Перейдите в **Table Editor**
3. Проверьте таблицы:
   - `users` - должен появиться новый пользователь
   - `surveys` - должен появиться новый опрос
   - `defects` - должен появиться новый дефект
4. Перейдите в **Storage**
5. Проверьте `defect-images` bucket - должно появиться фото

## Если не работает:

### Проверьте логи:
```javascript
// В консоли Expo должно быть:
"Real Supabase authentication successful, user ID: xxx-xxx-xxx"
"Creating survey for real user: xxx-xxx-xxx"
"Real survey created: {...}"
```

### Возможные проблемы:
1. **Auth не включен** - включите в Supabase
2. **RLS блокирует** - временно выключите
3. **Firewall блокирует** - проверьте Windows Firewall
4. **IP адрес изменился** - обновите в config.ts

## Следующие шаги:
1. ✅ Включить Supabase Auth
2. ✅ Создать тестового пользователя
3. ✅ Войти в приложении
4. ✅ Создать опрос и дефект
5. ✅ Проверить данные в Supabase

После этого все фото будут сохраняться в Supabase и видны в таблицах!
