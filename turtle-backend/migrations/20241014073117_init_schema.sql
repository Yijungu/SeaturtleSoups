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

CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,              -- 고유 사용자 ID (자동 증가)
    username VARCHAR(255) NOT NULL,           -- 사용자 이름
    discriminator INT NOT NULL,               -- 닉네임 태그 (4자리 숫자)
    password_hash TEXT NOT NULL,              -- 비밀번호 해시
    security_code VARCHAR(8) NOT NULL,        -- 8자리 보안 코드
    created_at TIMESTAMP NOT NULL,            -- 계정 생성 시간
    UNIQUE (username, discriminator)          -- username과 discriminator 조합의 고유성 보장
);