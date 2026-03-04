-- Упрощенная версия таблиц без RLS для быстрого тестирования
-- Выполните этот SQL код если RLS вызывает проблемы

-- 1. Удаление существующих таблиц (если нужно)
DROP TABLE IF EXISTS defects CASCADE;
DROP TABLE IF EXISTS surveys CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Создание таблиц
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE surveys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    industry_gost TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE defects (
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

-- 3. Создание индексов
CREATE INDEX idx_surveys_user_id ON surveys(user_id);
CREATE INDEX idx_defects_survey_id ON defects(survey_id);
CREATE INDEX idx_defects_created_at ON defects(created_at);

-- 4. Создание Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('defect-images', 'defect-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('defect-reports', 'defect-reports', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Политики для Storage (простые)
CREATE POLICY "Public access to defect images" ON storage.objects
    FOR ALL USING (bucket_id = 'defect-images');

-- 6. Тестовые данные
INSERT INTO users (id, email)
VALUES ('550e8400-e29b-41d4-a716-446655440001', 'test@example.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO surveys (id, user_id, name, industry_gost)
VALUES ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Test Building Survey', 'GOST 31937-2011')
ON CONFLICT (id) DO NOTHING;

-- 7. Проверка
SELECT 'Tables created successfully' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'surveys', 'defects');
