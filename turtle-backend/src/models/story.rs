use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::NaiveDate;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Story {
    pub id: i32,
    pub title: Option<String>,      // 스토리 제목
    pub question: String,           // 스토리 질문
    pub answer: String,             // 스토리 정답
    pub background: Option<String>, // 스토리 배경
    pub date: NaiveDate,            // 스토리 날짜
    pub success_count: Option<i32>, // 성공 횟수
    pub rating: Option<f32>,        // 평점
    pub thumbnail: Option<String>,  // 섬네일 URL
    pub creater_id: String,         // 생성자 ID
    pub creater_password: String,   // 생성자 비밀번호 (해시됨)
    pub is_reviewed: bool,          // 검토 여부
}

#[derive(Deserialize)]
pub struct StoryRequest {
    pub title: Option<String>,      // 요청에서 받은 제목
    pub question: String,           // 요청에서 받은 질문
    pub answer: String,             // 요청에서 받은 정답
    pub background: Option<String>, // 요청에서 받은 배경
    pub date: String,               // 요청에서 받은 날짜 (문자열)
    pub creater_id: String,         // 요청에서 받은 생성자 ID
    pub creater_password: String,   // 요청에서 받은 생성자 비밀번호
    pub thumbnail: Option<String>,  // 섬네일 URL
}
#[derive(Deserialize)]
pub struct ValidateRequest {
    pub id: i32,              // 스토리 ID
    pub creater_id: String,   // 생성자 ID
    pub creater_password: String, // 생성자 비밀번호
}

#[derive(Serialize)]
pub struct ValidateResponse {
    pub title: Option<String>,      // 스토리 제목
    pub question: String,           // 스토리 질문
    pub answer: String,             // 스토리 정답
    pub thumbnail: Option<String>,  // 섬네일 URL
}

#[derive(Deserialize)]
pub struct UpdateReviewedRequest {
    pub is_reviewed: bool, // 검토 여부
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StorySummary {
    pub id: i32,                    // 스토리 ID
    pub title: Option<String>,      // 제목
    pub question: String,           // 질문
    pub date: chrono::NaiveDate,    // 날짜
    pub success_count: Option<i32>, // 성공 횟수
    pub rating: Option<f32>,        // 평점
    pub thumbnail: Option<String>,  // 섬네일
    pub creater_id: String,         // 생성자 ID
    pub is_reviewed: bool,          // 검토 여부
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StoryAnswer {
    pub id: i32,  
    pub answer: String,             // 스토리 정답
    pub background: Option<String>, // 스토리 배경
}