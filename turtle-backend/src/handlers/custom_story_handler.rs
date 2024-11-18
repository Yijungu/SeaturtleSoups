use crate::models::custom_story::CustomStory;
use bcrypt::{hash, DEFAULT_COST};
use serde::Deserialize;
use sqlx::PgPool;
use actix_web::{web, HttpResponse, Responder};

// 입력 데이터 구조체
#[derive(Deserialize)]
pub struct NewStoryInput {
    pub title: Option<String>,
    pub question: String,
    pub answer: String,
    pub hint1: String,
    pub hint2: String,
    pub creater_id: String,
    pub creater_password: String,
}

// 새 데이터 삽입 핸들러
pub async fn create_custom_story(
    pool: web::Data<PgPool>,
    input: web::Json<NewStoryInput>,
) -> impl Responder {
    // 비밀번호 해싱
    let hashed_password = match hash(&input.creater_password, DEFAULT_COST) {
        Ok(h) => h,
        Err(_) => return HttpResponse::InternalServerError().body("Failed to hash password"),
    };

    // 데이터 삽입
    let result = sqlx::query!(
        r#"
        INSERT INTO custom_stories (title, question, answer, hint1, hint2, creater_id, creater_password)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        "#,
        input.title,
        input.question,
        input.answer,
        input.hint1,
        input.hint2,
        input.creater_id,
        hashed_password
    )
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(_) => HttpResponse::Ok().body("Story created successfully"),
        Err(e) => HttpResponse::InternalServerError().body(format!("Error: {}", e)),
    }
}

// 검토 여부 업데이트 핸들러
#[derive(Deserialize)]
pub struct UpdateReviewStatus {
    pub is_reviewed: bool,
}

pub async fn update_is_reviewed(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    input: web::Json<UpdateReviewStatus>,
) -> impl Responder {
    let id = path.into_inner();

    let result = sqlx::query!(
        "UPDATE custom_stories SET is_reviewed = $1 WHERE id = $2",
        input.is_reviewed,
        id
    )
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(_) => HttpResponse::Ok().body("Review status updated successfully"),
        Err(e) => HttpResponse::InternalServerError().body(format!("Error: {}", e)),
    }
}

// 데이터 삭제 핸들러
pub async fn delete_custom_story(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
) -> impl Responder {
    let id = path.into_inner();

    let result = sqlx::query!("DELETE FROM custom_stories WHERE id = $1", id)
        .execute(pool.get_ref())
        .await;

    match result {
        Ok(_) => HttpResponse::Ok().body("Story deleted successfully"),
        Err(e) => HttpResponse::InternalServerError().body(format!("Error: {}", e)),
    }
}
