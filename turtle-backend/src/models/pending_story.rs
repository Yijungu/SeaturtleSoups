use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct PendingStory {
    pub id: i32,             // 테이블의 기본 키
    pub story_id: i32,       // 참조된 story 테이블의 ID
    pub title: String,       // 제목
    pub question: String,    // 질문
    pub answer: String,      // 답변
    pub thumbnail: Option<String>, // 섬네일 URL (선택적)
}