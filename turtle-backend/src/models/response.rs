use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Response {
    pub id: Option<i32>,
    pub question: String,
    pub response: String,
    pub created_at: Option<NaiveDateTime>,
}

#[derive(Clone, Debug)]
pub struct Rating {
    pub count: usize,  // 평가 횟수
    pub average: f32,  // 평균 평점
}

pub type SharedRating = Arc<Mutex<Rating>>;