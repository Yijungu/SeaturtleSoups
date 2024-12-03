use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct User {
    pub user_id: i32,                      // 고유 사용자 ID
    pub username: String,                  // 사용자 아이디 (닉네임)
    pub discriminator: i32,                // 닉네임 태그
    pub password_hash: String,             // 비밀번호 해시
    pub security_code: String,             // 보안 코드
    pub created_at: NaiveDateTime, // 계정 생성 시간
}
