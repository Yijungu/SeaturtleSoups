CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    background TEXT,
    date DATE NOT NULL,
    success_count INT DEFAULT 0,
    rating FLOAT DEFAULT 0.0,
    thumbnail TEXT,
    creater_id TEXT NOT NULL, -- 새 필드
    creater_password TEXT NOT NULL, -- 새 필드
    is_reviewed BOOLEAN DEFAULT FALSE, -- 검토 여부 필드
    hint1 TEXT DEFAULT '', -- hint1 기본값
    hint2 TEXT DEFAULT ''  -- hint2 기본값
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

CREATE TABLE IF NOT EXISTS pending_stories (
    id SERIAL PRIMARY KEY,
    story_id INT NOT NULL, -- Story 테이블의 id 참조
    title TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    thumbnail TEXT,
    FOREIGN KEY (story_id) REFERENCES stories (id) ON DELETE CASCADE
);