use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct CustomStory {
    pub id: i32,
    pub title: Option<String>,
    pub question: String,
    pub answer: String,
    pub background: Option<String>,
    pub success_count: Option<i32>,
    pub rating: Option<f32>,
    pub hint1: String,
    pub hint2: String,
    pub creater_id: String,
    pub creater_password: String,
    pub is_reviewed: bool, // 검토 여부 추가
}
