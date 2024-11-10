CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    background TEXT,
    date DATE NOT NULL,
    success_count INT DEFAULT 0,
    rating FLOAT DEFAULT 0.0,
    hint1 TEXT,  -- 첫 번째 힌트 필드 추가
    hint2 TEXT   -- 두 번째 힌트 필드 추가
);

CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,        -- 자동 증가 ID
    description TEXT NOT NULL     -- 불만 사항 내용
);