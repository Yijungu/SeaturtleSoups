use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::NaiveDate;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Story {
    pub id: i32,
    pub title: Option<String>,
    pub question: String,
    pub answer: String,
    pub background: Option<String>,
    pub date: NaiveDate,  // 날짜 필드를 NaiveDate로 유지
    pub success_count: Option<i32>,
    pub rating: Option<f32>,
    pub hint1: Option<String>,  // Option으로 수정
    pub hint2: Option<String>, 
}
