use crate::models::story::Story;
use actix_web::{delete, get, post, web, HttpResponse, Responder};
use chrono::{Datelike, Duration, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::str::FromStr;
use std::sync::Arc;
use tokio::sync::Mutex;
type StoryList = Arc<Mutex<Vec<Story>>>;
use crate::services::story_saver::update_story_data_from_db;
use crate::services::openai_service::fetch_background_from_openai;
#[derive(Serialize)] // JSON 응답을 위해 Serialize 파생 사용
struct Hints {
    hint1: Option<String>,
    hint2: Option<String>,
}
#[derive(Deserialize)]
pub struct StoryRequest {
    pub question: String,
    pub answer: String,
    pub background: Option<String>,
    pub date: String, // 'YYYY-MM-DD' 형식
    pub hint1: Option<String>,
    pub hint2: Option<String>,
}

#[get("/stories/refresh")]
async fn refresh_story(
    story_data: web::Data<StoryList>,
    db_pool: web::Data<PgPool>,
) -> impl Responder {
    match update_story_data_from_db(&story_data, &db_pool).await {
        Ok(_) => HttpResponse::Ok().body("Story data updated successfully"),
        Err(err) => {
            eprintln!("Failed to update story data: {}", err);
            HttpResponse::InternalServerError().body("Failed to update story data")
        }
    }
}

#[get("/stories")]
async fn get_all_stories(pool: web::Data<PgPool>) -> impl Responder {
    // 데이터베이스에서 모든 Story 데이터를 가져오는 쿼리
    let result = sqlx::query_as!(
        Story,
        r#"
        SELECT 
            id, question, answer, background, date, success_count, 
            rating::float4 AS rating,  -- Cast to f32
            hint1, hint2
        FROM stories
        "#
    )
    .fetch_all(pool.get_ref())
    .await;

    // 쿼리 결과 처리
    match result {
        Ok(stories) => HttpResponse::Ok().json(stories), // 성공적으로 가져온 경우 JSON 응답
        Err(err) => {
            eprintln!("Failed to fetch stories: {}", err); // 에러 로그 출력
            HttpResponse::InternalServerError().body("Failed to fetch stories") // 500 응답 반환
        }
    }
}

#[post("/stories")]
async fn insert_story_to_db(
    db_pool: web::Data<PgPool>,
    new_story: web::Json<StoryRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    // 반환 타입 변경
    let mut story = new_story.into_inner();

    // 날짜 문자열을 NaiveDate로 파싱하고 에러 처리
    let date = match NaiveDate::from_str(&story.date) {
        Ok(d) => d,
        Err(_) => return Ok(HttpResponse::BadRequest().body("Invalid date format")),
    };


    if story.background.is_none() {
        // Fetch background data from OpenAI
        match fetch_background_from_openai(&story.question, &story.answer).await {
            Ok(background) => story.background = Some(background),
            Err(_) => return Ok(HttpResponse::InternalServerError().body("Failed to fetch background data")),
        }
    }

    println!("{}", story.background.as_deref().unwrap_or(""));

    // 스토리 삽입 쿼리 실행
    let result = sqlx::query!(
        "INSERT INTO stories (question, answer, background, date, success_count, rating, hint1, hint2) 
         VALUES ($1, $2, $3, $4, 0, 0, $5, $6)
         ON CONFLICT (date) 
         DO UPDATE SET 
            question = EXCLUDED.question,
            answer = EXCLUDED.answer,
            background = EXCLUDED.background,
            hint1 = EXCLUDED.hint1,
            hint2 = EXCLUDED.hint2",
        story.question,
        story.answer,
        story.background.as_deref().unwrap_or(""),
        date,
        story.hint1,
        story.hint2
    )
    .execute(db_pool.get_ref())
    .await;

    // 쿼리 실행 결과 처리
    match result {
        Ok(_) => Ok(HttpResponse::Created().body("Story inserted successfully")),
        Err(sqlx::Error::Database(err)) if err.constraint() == Some("unique_story_date") => {
            Ok(HttpResponse::Conflict().body("Story for this date already exists"))
        }
        Err(err) => Ok(HttpResponse::InternalServerError().body(format!("DB Error: {}", err))),
    }
}

#[delete("/stories/{date}")]
async fn delete_story(db_pool: web::Data<PgPool>, date: web::Path<NaiveDate>) -> impl Responder {
    let result = sqlx::query!("DELETE FROM stories WHERE date = $1", *date)
        .execute(db_pool.get_ref())
        .await;

    match result {
        Ok(result) => {
            if result.rows_affected() == 0 {
                HttpResponse::NotFound().body("No story found for the given date")
            } else {
                HttpResponse::Ok().body("Story deleted successfully")
            }
        }
        Err(err) => HttpResponse::InternalServerError().body(format!("DB Error: {}", err)),
    }
}

#[get("/memory/story/question")]
async fn get_story_question_from_memory(data: web::Data<StoryList>) -> impl Responder {
    let stories = data.lock().await; // 비동기적 잠금
    if let Some(story) = stories.first() {
        HttpResponse::Ok().body(story.question.clone()) // 소유권 넘김
    } else {
        HttpResponse::NotFound().body("No stories available in memory")
    }
}

#[get("/memory/story/answer")]
async fn get_story_answer_from_memory(data: web::Data<StoryList>) -> impl Responder {
    let stories = data.lock().await; // 비동기적 잠금
    if let Some(story) = stories.first() {
        HttpResponse::Ok().body(story.answer.clone()) // 소유권 넘김
    } else {
        HttpResponse::NotFound().body("No stories available in memory")
    }
}

#[get("/memory/story/hint")]
async fn get_story_hints(data: web::Data<StoryList>) -> impl Responder {
    let stories = data.lock().await; // 비동기적 잠금
    if let Some(story) = stories.first() {
        let hints = Hints {
            hint1: story.hint1.clone(), // 소유권 넘김
            hint2: story.hint2.clone(), // 소유권 넘김
        };
        HttpResponse::Ok().json(hints) // JSON 응답 반환
    } else {
        HttpResponse::NotFound().body("No stories available in memory")
    }
}
