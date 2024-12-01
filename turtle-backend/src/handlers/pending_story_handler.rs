use actix_web::{post, get, delete, web, HttpResponse, Responder};
use serde::Deserialize;
use sqlx::PgPool;
use crate::models::pending_story::PendingStory;

#[derive(Deserialize)]
pub struct PendingStoryRequest {
    pub story_id: i32,          // 참조된 story의 ID
    pub title: String,          // 제목
    pub question: String,       // 질문
    pub answer: String,         // 답변
    pub thumbnail: Option<String>, // 섬네일 (옵션)
}

#[derive(Deserialize)]
pub struct UpdateStoryRequest {
    pub story_id: i32,        // 업데이트할 story의 ID
    pub title: String,        // 새로운 제목
    pub question: String,     // 새로운 질문
    pub answer: String,       // 새로운 답변
    pub thumbnail: Option<String>, // 새로운 섬네일 (선택적)
}



#[post("/pending_stories")]
async fn insert_pending_story(
    db_pool: web::Data<PgPool>,
    story: web::Json<PendingStoryRequest>,
) -> impl Responder {
    // 요청 데이터 구조 분해
    let PendingStoryRequest {
        story_id,
        title,
        question,
        answer,
        thumbnail,
    } = story.into_inner();

    // 데이터베이스에 삽입
    let result = sqlx::query!(
        r#"
        INSERT INTO pending_stories (story_id, title, question, answer, thumbnail)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
        "#,
        story_id,
        title,
        question,
        answer,
        thumbnail
    )
    .fetch_one(db_pool.get_ref())
    .await;

    // 응답 처리
    match result {
        Ok(record) => HttpResponse::Created().json(format!("Pending story created with ID: {}", record.id)),
        Err(err) => {
            eprintln!("Failed to insert pending story: {}", err);
            HttpResponse::InternalServerError().body("Failed to insert pending story")
        }
    }
}

#[get("/pending_stories")]
async fn get_all_pending_stories(db_pool: web::Data<PgPool>) -> impl Responder {
    let result = sqlx::query_as!(
        PendingStory, // 새로 정의한 구조체 사용
        r#"
        SELECT id, story_id, title, question, answer, thumbnail
        FROM pending_stories
        "#
    )
    .fetch_all(db_pool.get_ref())
    .await;

    match result {
        Ok(stories) => HttpResponse::Ok().json(stories), // 성공적으로 모든 데이터를 반환
        Err(err) => {
            eprintln!("Failed to fetch all pending stories: {}", err);
            HttpResponse::InternalServerError().body("Failed to fetch pending stories")
        }
    }
}

#[delete("/pending_stories/{id}")]
async fn delete_pending_story(
    db_pool: web::Data<PgPool>,
    path: web::Path<i32>,
) -> impl Responder {
    let id = path.into_inner();

    let result = sqlx::query!(
        r#"
        DELETE FROM pending_stories
        WHERE id = $1
        "#,
        id
    )
    .execute(db_pool.get_ref())
    .await;

    match result {
        Ok(res) => {
            if res.rows_affected() == 0 {
                HttpResponse::NotFound().body(format!("Pending story with ID {} not found", id))
            } else {
                HttpResponse::Ok().body(format!("Pending story with ID {} deleted successfully", id))
            }
        }
        Err(err) => {
            eprintln!("Failed to delete pending story with ID {}: {}", id, err);
            HttpResponse::InternalServerError().body("Failed to delete pending story")
        }
    }
}

#[post("/pending_stories/apply")]
async fn apply_pending_story(
    db_pool: web::Data<PgPool>,
    story_data: web::Json<UpdateStoryRequest>,
) -> impl Responder {
    let UpdateStoryRequest {
        story_id,
        title,
        question,
        answer,
        thumbnail,
    } = story_data.into_inner();

    // Stories 테이블 업데이트
    let result = sqlx::query!(
        r#"
        UPDATE stories
        SET title = $1, question = $2, answer = $3, thumbnail = $4
        WHERE id = $5
        "#,
        title,
        question,
        answer,
        thumbnail,
        story_id
    )
    .execute(db_pool.get_ref())
    .await;

    match result {
        Ok(res) => {
            if res.rows_affected() > 0 {
                HttpResponse::Ok().body(format!("Story with ID {} updated successfully", story_id))
            } else {
                HttpResponse::NotFound().body(format!("No story found with ID {}", story_id))
            }
        }
        Err(err) => {
            eprintln!("Failed to update story: {}", err);
            HttpResponse::InternalServerError().body("Failed to update story")
        }
    }
}