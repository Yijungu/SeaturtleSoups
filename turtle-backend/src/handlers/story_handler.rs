use crate::models::story::{Story, StorySummary, StoryAnswer, StoryRequest, ValidateRequest, ValidateResponse, UpdateReviewedRequest};
use actix_web::{delete, get, post, put, web, HttpResponse, Responder};
use chrono::{Datelike, Duration, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::str::FromStr;
use std::sync::Arc;
use tokio::sync::Mutex;
type StoryList = Arc<Mutex<Vec<Story>>>;
use crate::services::openai_service::fetch_background_from_openai;
use bcrypt::{hash, DEFAULT_COST};

#[get("/stories/reviewed")]
async fn get_all_reviewed_stories(pool: web::Data<PgPool>) -> impl Responder {
    let result = sqlx::query_as!(
        StorySummary,
        r#"
        SELECT 
            id, title, question, date, success_count, 
            rating::float4 AS rating,  -- Cast to f32
            thumbnail, creater_id, is_reviewed
        FROM stories
        WHERE is_reviewed = true
        "#
    )
    .fetch_all(pool.get_ref())
    .await;

    match result {
        Ok(stories) => HttpResponse::Ok().json(stories),
        Err(err) => {
            eprintln!("Failed to fetch reviewed stories: {}", err);
            HttpResponse::InternalServerError().body("Failed to fetch reviewed stories")
        }
    }
}


#[get("/stories")]
async fn get_all_stories(pool: web::Data<PgPool>) -> impl Responder {
    let result = sqlx::query_as!(
        StorySummary,
        r#"
        SELECT 
            id, title, question, date, success_count, 
            rating::float4 AS rating,  -- Cast to f32
            thumbnail, creater_id, is_reviewed
        FROM stories
        "#
    )
    .fetch_all(pool.get_ref())
    .await;

    match result {
        Ok(stories) => HttpResponse::Ok().json(stories),
        Err(err) => {
            eprintln!("Failed to fetch stories: {}", err);
            HttpResponse::InternalServerError().body("Failed to fetch stories")
        }
    }
}

#[get("/stories/{id}")]
async fn get_story_by_id(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
) -> impl Responder {
    let id = path.into_inner();

    let result = sqlx::query_as!(
        StoryAnswer,
        r#"
        SELECT 
            id, answer, background
        FROM stories
        WHERE id = $1
        "#,
        id
    )
    .fetch_optional(pool.get_ref())
    .await;

    match result {
        Ok(Some(story)) => HttpResponse::Ok().json(story),
        Ok(None) => HttpResponse::NotFound().body("Story not found"),
        Err(err) => {
            eprintln!("Failed to fetch story by id: {}", err);
            HttpResponse::InternalServerError().body("Failed to fetch story")
        }
    }
}
#[post("/stories")]
async fn insert_story_to_db(
    db_pool: web::Data<PgPool>,
    new_story: web::Json<StoryRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    let mut story = new_story.into_inner();

    // 날짜 문자열을 NaiveDate로 변환
    let date = match NaiveDate::from_str(&story.date) {
        Ok(d) => d,
        Err(_) => return Ok(HttpResponse::BadRequest().body("Invalid date format")),
    };

    // 비밀번호 해싱
    let hashed_password = match hash(&story.creater_password, DEFAULT_COST) {
        Ok(hashed) => hashed,
        Err(_) => return Ok(HttpResponse::InternalServerError().body("Failed to hash password")),
    };

    // OpenAI에서 배경 데이터를 가져오기
    if story.background.is_none() {
        match fetch_background_from_openai(&story.question, &story.answer).await {
            Ok(background) => story.background = Some(background),
            Err(_) => return Ok(HttpResponse::InternalServerError().body("Failed to fetch background data")),
        }
    }

    // 데이터베이스에 삽입
    let result = sqlx::query!(
        "INSERT INTO stories (title, question, answer, background, date, success_count, rating, thumbnail, creater_id, creater_password, hint1, hint2) 
         VALUES ($1, $2, $3, $4, $5, 0, 0, $6, $7, $8, $9, $10)",
        story.title,
        story.question,
        story.answer,
        story.background.as_deref().unwrap_or(""),
        date,
        story.thumbnail,
        story.creater_id,
        hashed_password,     // 해싱된 비밀번호 삽입
        "",                 // hint1 기본값
        ""                  // hint2 기본값
    )
    .execute(db_pool.get_ref())
    .await;

    // 결과 처리
    match result {
        Ok(_) => Ok(HttpResponse::Created().body("Story inserted successfully")),
        Err(err) => Ok(HttpResponse::InternalServerError().body(format!("DB Error: {}", err))),
    }
}

#[delete("/stories/{id}")]
async fn delete_story(db_pool: web::Data<PgPool>, id: web::Path<i32>) -> impl Responder {
    let story_id = id.into_inner();

    let result = sqlx::query!("DELETE FROM stories WHERE id = $1", story_id)
        .execute(db_pool.get_ref())
        .await;

    match result {
        Ok(result) => {
            if result.rows_affected() == 0 {
                HttpResponse::NotFound().body("No story found for the given ID")
            } else {
                HttpResponse::Ok().body("Story deleted successfully")
            }
        }
        Err(err) => HttpResponse::InternalServerError().body(format!("DB Error: {}", err)),
    }
}

#[post("/stories/validate")]
async fn validate_story_creater(
    db_pool: web::Data<PgPool>,
    request: web::Json<ValidateRequest>,
) -> impl Responder {
    let ValidateRequest {
        id,
        creater_id,
        creater_password,
    } = request.into_inner();

    // 스토리를 데이터베이스에서 조회
    let result = sqlx::query!(
        r#"
        SELECT title, question, answer, thumbnail, creater_password
        FROM stories
        WHERE id = $1 AND creater_id = $2
        "#,
        id,
        creater_id
    )
    .fetch_optional(db_pool.get_ref())
    .await;

    match result {
        Ok(Some(story)) => {
            // 비밀번호 검증
            if bcrypt::verify(creater_password, &story.creater_password).unwrap_or(false) {
                // 비밀번호가 일치하면 필요한 정보 반환
                HttpResponse::Ok().json(ValidateResponse {
                    title: story.title,
                    question: story.question,
                    answer: story.answer,
                    thumbnail: story.thumbnail,
                })
            } else {
                // 비밀번호가 일치하지 않으면 에러 메시지 반환
                HttpResponse::Unauthorized().body("Invalid password")
            }
        }
        Ok(None) => HttpResponse::NotFound().body("Story not found or invalid creator ID"),
        Err(err) => {
            eprintln!("Database error: {}", err);
            HttpResponse::InternalServerError().body("Failed to validate story")
        }
    }
}

#[put("/stories/{id}/reviewed")]
async fn update_is_reviewed(
    db_pool: web::Data<PgPool>,
    path: web::Path<i32>,
    body: web::Json<UpdateReviewedRequest>,
) -> impl Responder {
    let id = path.into_inner();
    let is_reviewed = body.is_reviewed;

    let result = sqlx::query!(
        r#"
        UPDATE stories
        SET is_reviewed = $1
        WHERE id = $2
        RETURNING id
        "#,
        is_reviewed,
        id
    )
    .fetch_optional(db_pool.get_ref())
    .await;

    match result {
        Ok(Some(_)) => HttpResponse::Ok().body(format!("Story with ID {} updated successfully", id)),
        Ok(None) => HttpResponse::NotFound().body("Story not found"),
        Err(err) => {
            eprintln!("Failed to update is_reviewed: {}", err);
            HttpResponse::InternalServerError().body("Failed to update story")
        }
    }
}