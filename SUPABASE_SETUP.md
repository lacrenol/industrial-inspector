# Supabase Architecture Setup

## Что нужно для полной интеграции с Supabase:

### 1. Таблицы в Supabase (уже созданы):
```sql
-- Таблица пользователей (дополнительно)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица опросов
CREATE TABLE surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
```

### 2. Supabase Auth Configuration:

В настройках Supabase проекта:
- Authentication → Settings → Включить Email/Password auth
- Authentication → Settings → Добавить URL редиректа для Expo
- Создать service role key для backend

### 3. Environment Variables:

**Backend (.env):**
```env
SUPABASE_URL=https://ienrlqnjfnoimuuoxmpp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllbnJscW5qZm5vaW11dW94bXBwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4NDQwOSwiZXhwIjoyMDg4MDYwNDA5fQ.A9L02dvxaaVGmgFEQQVjBCrX-PuFCLdnUjWbLdkrcQg
SUPABASE_BUCKET_IMAGES=defect-images
SUPABASE_BUCKET_REPORTS=defect-reports
GEMINI_API_KEY=AIzaSyAdsazHEXPhHX29PJ09Q3rNlaok5KguFwI
```

**Mobile (config.ts):**
```typescript
export const SUPABASE_URL = "https://ienrlqnjfnoimuuoxmpp.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllbnJscW5qZm5vaW11dW94bXBwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4NDQwOSwiZXhwIjoyMDg4MDYwNDA5fQ.";
```

### 4. RLS Policies (Row Level Security):

```sql
-- Users могут видеть только свои опросы
CREATE POLICY "Users can view own surveys" ON surveys
  FOR SELECT USING (auth.uid() = user_id);

-- Users могут создавать только свои опросы
CREATE POLICY "Users can create own surveys" ON surveys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users могут обновлять только свои опросы
CREATE POLICY "Users can update own surveys" ON surveys
  FOR UPDATE USING (auth.uid() = user_id);

-- Users могут удалять только свои опросы
CREATE POLICY "Users can delete own surveys" ON surveys
  FOR DELETE USING (auth.uid() = user_id);

-- Аналогичные политики для defects
CREATE POLICY "Users can view own defects" ON defects
  FOR SELECT USING (auth.uid() = survey_id IN (SELECT id FROM surveys WHERE user_id = auth.uid()));

CREATE POLICY "Users can create own defects" ON defects
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM surveys WHERE id = survey_id));
```

### 5. Backend API Changes:

**main.py - добавить Supabase auth:**
```python
from supabase_auth import SupabaseAuthClient

@app.post("/auth/signup")
async def signup(email: str, password: str):
    # Создание пользователя в Supabase Auth
    pass

@app.post("/auth/login")
async def login(email: str, password: str):
    # Аутентификация через Supabase Auth
    pass
```

### 6. Mobile App Changes:

**AuthScreen.tsx - реальная аутентификация:**
```typescript
const handleAuth = async (mode: "signIn" | "signUp") => {
  try {
    if (mode === "signUp") {
      const { data, error } = await supabase.auth.signUp({ email, password });
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    }
    // Обработка результатов
  } catch (error) {
    // Обработка ошибок
  }
};
```

**Direct Supabase queries вместо backend:**
```typescript
// Вместо fetch к backend
const { data, error } = await supabase
  .from('surveys')
  .select('*')
  .eq('user_id', user.id);
```

## Текущая проблема:

Сейчас у вас:
- ✅ Backend с Supabase интеграцией
- ✅ Mobile app с backend API
- ❌ Mobile app не использует Supabase Auth
- ❌ ReportsScreen использует mock данные

## Решение:

1. Включить Supabase Auth
2. Настроить RLS policies  
3. Обновить mobile app для использования Supabase Auth
4. Заменить mock данные на реальные Supabase queries
5. Добавить обработку ошибок аутентификации

## Альтернативный путь (быстрый):

Оставить backend как прокси для Supabase, но:
- Добавить real auth endpoints в backend
- Обновить mobile app для использования этих endpoints
- Убрать mock данные из ReportsScreen
