# Проверка структуры таблицы defects

## Что проверить в Supabase:

### 1. Откройте Supabase проект
https://ienrlqnjfnoimuuoxmpp.supabase.co

### 2. Перейдите в Table Editor
Выберите таблицу `defects`

### 3. Проверьте структуру колонок:
Должны быть колонки:
- `id` (UUID, primary key)
- `survey_id` (UUID, foreign key)
- `image_url` (TEXT, not null)
- `axis` (TEXT, not null)
- `construction_type` (TEXT, not null)
- `location` (TEXT, nullable)
- `description` (TEXT, not null)
- `status_category` (TEXT, not null)
- `created_at` (TIMESTAMP, default now())

### 4. Проверьте RLS (Row Level Security):
Если RLS включен, убедитесь что есть политики:
```sql
-- Временно выключить RLS для тестирования
ALTER TABLE defects DISABLE ROW LEVEL SECURITY;
```

### 5. Проверьте Foreign Key:
Убедитесь что `survey_id` ссылается на существующий `surveys.id`

### 6. Тестовый SQL для проверки:
```sql
-- Проверить структуру
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'defects' 
ORDER BY ordinal_position;

-- Проверить RLS статус
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'defects';

-- Вставить тестовую запись
INSERT INTO defects (survey_id, image_url, axis, construction_type, location, description, status_category)
VALUES ('test-survey-id', 'test-url', 'X', 'Concrete', 'test location', 'test description', 'B');
```

### 7. Если есть проблемы:
1. **RLS включен** - временно выключите
2. **Foreign key constraint** - проверьте что survey_id существует
3. **Column constraints** - проверите типы данных
4. **Permissions** - убедитесь что service role имеет права

### 8. Логи из backend:
При отправке фото ищите:
```
DEBUG: Defect data to insert: {...}
DEBUG: Insert response: {...}
DEBUG: Response data: [...]
DEBUG: Response error: ...
```

Если есть ошибка - пришлите полный лог!
