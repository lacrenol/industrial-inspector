# 🚀 Supabase Setup Instructions

## Как создать таблицы в Supabase:

### 1. Откройте Supabase проект
- Перейдите на https://ienrlqnjfnoimuuoxmpp.supabase.co
- Войдите в ваш аккаунт

### 2. Откройте SQL Editor
- В левом меню выберите **SQL Editor**
- Нажмите **New query**

### 3. Выполните SQL код
- Скопируйте весь код из файла `CREATE_SUPABASE_TABLES.sql`
- Вставьте в SQL Editor
- Нажмите **Run** или **Ctrl + Enter**

### 4. Проверьте результат
После выполнения должны появиться:
- ✅ 3 таблицы: `users`, `surveys`, `defects`
- ✅ 2 storage buckets: `defect-images`, `defect-reports`
- ✅ RLS политики безопасности
- ✅ Индексы для производительности

### 5. Альтернативный способ (через UI):

#### Создание таблицы `users`:
1. **Table Editor** → **Create a new table**
2. **Name**: `users`
3. **Columns**:
   - `id` - `uuid` - Primary Key - Default: `gen_random_uuid()`
   - `email` - `text` - Unique - Not null
   - `created_at` - `timestamptz` - Default: `now()`

#### Создание таблицы `surveys`:
1. **Create a new table**
2. **Name**: `surveys`
3. **Columns**:
   - `id` - `uuid` - Primary Key - Default: `gen_random_uuid()`
   - `user_id` - `uuid` - Foreign Key → `users.id`
   - `name` - `text` - Not null
   - `industry_gost` - `text` - Not null
   - `created_at` - `timestamptz` - Default: `now()`

#### Создание таблицы `defects`:
1. **Create a new table**
2. **Name**: `defects`
3. **Columns**:
   - `id` - `uuid` - Primary Key - Default: `gen_random_uuid()`
   - `survey_id` - `uuid` - Foreign Key → `surveys.id`
   - `image_url` - `text` - Not null
   - `axis` - `text` - Not null - Check: `axis IN ('X', 'Y')`
   - `construction_type` - `text` - Not null - Check: `construction_type IN ('Concrete', 'Brick', 'Metal', 'Roof')`
   - `location` - `text` - Nullable
   - `description` - `text` - Not null
   - `status_category` - `text` - Not null - Check: `status_category IN ('A', 'B', 'C', 'D')`
   - `created_at` - `timestamptz` - Default: `now()`

### 6. Создание Storage Buckets:
1. **Storage** → **New bucket**
2. **Bucket name**: `defect-images`
3. **Public bucket**: ✅
4. **File size limit**: `5MB`
5. Повторите для `defect-reports`

### 7. Включение RLS (Row Level Security):
1. **Authentication** → **Policies**
2. Для каждой таблицы включите **Enable RLS**
3. Добавьте политики из SQL файла

### 8. Проверка:
После настройки проверьте:
- **Table Editor** - должны быть 3 таблицы
- **Storage** - должны быть 2 buckets
- **Authentication** → **Policies** - должны быть политики

### 9. Если есть проблемы:
```sql
-- Удалить все таблицы и начать заново
DROP TABLE IF EXISTS defects CASCADE;
DROP TABLE IF EXISTS surveys CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Удалить buckets
DELETE FROM storage.objects WHERE bucket_id IN ('defect-images', 'defect-reports');
DELETE FROM storage.buckets WHERE id IN ('defect-images', 'defect-reports');
```

### 10. После настройки:
1. Перезапустите backend
2. Попробуйте отправить фото из приложения
3. Проверьте таблицы в Supabase

Теперь все должно работать! 🎉
