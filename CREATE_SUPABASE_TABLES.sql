-- Создание таблиц для Industrial Defect Examiner
-- Выполните в Supabase SQL Editor

-- 1. Таблица пользователей (если еще не создана)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Таблица опросов
CREATE TABLE IF NOT EXISTS surveys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    industry_gost TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Таблица дефектов
CREATE TABLE IF NOT EXISTS defects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    axis TEXT NOT NULL CHECK (axis IN ('X', 'Y')),
    construction_type TEXT NOT NULL CHECK (construction_type IN ('Concrete', 'Brick', 'Metal', 'Roof')),
    location TEXT,
    description TEXT NOT NULL,
    status_category TEXT NOT NULL CHECK (status_category IN ('A', 'B', 'C', 'D')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Включение RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE defects ENABLE ROW LEVEL SECURITY;

-- 5. Создание политик безопасности (RLS Policies)

-- Политики для таблицы users
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Политики для таблицы surveys
CREATE POLICY "Users can view own surveys" ON surveys
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own surveys" ON surveys
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own surveys" ON surveys
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own surveys" ON surveys
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Политики для таблицы defects
CREATE POLICY "Users can view own defects" ON defects
    FOR SELECT USING (auth.uid()::text IN (SELECT user_id::text FROM surveys WHERE id = survey_id));

CREATE POLICY "Users can create own defects" ON defects
    FOR INSERT WITH CHECK (auth.uid()::text IN (SELECT user_id::text FROM surveys WHERE id = survey_id));

CREATE POLICY "Users can update own defects" ON defects
    FOR UPDATE USING (auth.uid()::text IN (SELECT user_id::text FROM surveys WHERE id = survey_id));

CREATE POLICY "Users can delete own defects" ON defects
    FOR DELETE USING (auth.uid()::text IN (SELECT user_id::text FROM surveys WHERE id = survey_id));

-- 6. Создание индексов для улучшения производительности
CREATE INDEX IF NOT EXISTS idx_surveys_user_id ON surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_defects_survey_id ON defects(survey_id);
CREATE INDEX IF NOT EXISTS idx_defects_created_at ON defects(created_at);

-- 7. Настройка Storage Buckets (если еще не созданы)
INSERT INTO storage.buckets (id, name, public)
VALUES ('defect-images', 'defect-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('defect-reports', 'defect-reports', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Политики для Storage
CREATE POLICY "Anyone can view defect images" ON storage.objects
    FOR SELECT USING (bucket_id = 'defect-images');

CREATE POLICY "Anyone can upload defect images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'defect-images');

CREATE POLICY "Anyone can update defect images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'defect-images');

CREATE POLICY "Anyone can delete defect images" ON storage.objects
    FOR DELETE USING (bucket_id = 'defect-images');

-- 9. Создание функций для удобства
CREATE OR REPLACE FUNCTION get_user_surveys(user_email TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    industry_gost TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.name, s.industry_gost, s.created_at
    FROM surveys s
    JOIN users u ON s.user_id = u.id
    WHERE u.email = user_email
    ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Создание триггеров для автоматического обновления created_at
CREATE OR REPLACE FUNCTION update_created_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_created_at
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_created_at_column();

CREATE TRIGGER update_surveys_created_at
    BEFORE INSERT ON surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_created_at_column();

CREATE TRIGGER update_defects_created_at
    BEFORE INSERT ON defects
    FOR EACH ROW
    EXECUTE FUNCTION update_created_at_column();

-- 11. Тестовые данные (опционально, можно удалить)
-- Создание тестового пользователя
INSERT INTO users (id, email)
VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com')
ON CONFLICT (id) DO NOTHING;

-- Создание тестового опроса
INSERT INTO surveys (id, user_id, name, industry_gost)
VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Test Survey', 'GOST 31937-2011')
ON CONFLICT (id) DO NOTHING;

-- Создание тестового дефекта
INSERT INTO defects (id, survey_id, image_url, axis, construction_type, location, description, status_category)
VALUES ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'https://example.com/test.jpg', 'X', 'Concrete', 'Test Location', 'Test Description', 'B')
ON CONFLICT (id) DO NOTHING;

-- 12. Проверка структуры
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('users', 'surveys', 'defects')
ORDER BY table_name, ordinal_position;
