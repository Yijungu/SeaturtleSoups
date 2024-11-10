use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Complaint {
    pub id: i32,                // 자동 증가 ID
    pub description: String,    // 불만 사항 내용
}

#[derive(Debug, Deserialize)]
pub struct NewComplaint {
    pub description: String,    // 클라이언트로부터 받는 불만 사항
}
