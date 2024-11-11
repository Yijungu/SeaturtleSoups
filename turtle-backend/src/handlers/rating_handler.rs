// src/handlers.rs
use actix_web::{post, web, HttpResponse, Responder};
use chrono::Utc;
use sqlx::PgPool;
use crate::models::Story;

#[post("/rating")]
pub async fn add_rating(
    pool: web::Data<PgPool>,
    new_rating: web::Json<f32>, // 새로운 평점만 받음
) -> impl Responder {
    let new_rating_value = new_rating.into_inner();
    let today = Utc::now().naive_utc().date(); // 오늘 날짜를 가져옴

    // 트랜잭션을 시작
    let mut tx = match pool.begin().await {
        Ok(tx) => tx,
        Err(_) => return HttpResponse::InternalServerError().body("Transaction start error"),
    };

    // 오늘 날짜의 Story를 가져옴
    let story = match sqlx::query_as::<_, Story>("SELECT * FROM stories WHERE date = $1")
        .bind(today)
        .fetch_optional(&mut tx)
        .await
    {
        Ok(Some(story)) => story,
        Ok(None) => return HttpResponse::NotFound().body("No story found for today"),
        Err(_) => return HttpResponse::InternalServerError().body("Error fetching story"),
    };

    // 현재 rating과 success_count 계산
    let updated_count = story.success_count.unwrap_or(0) + 1;
    let updated_rating = if let Some(avg_rating) = story.rating {
        ((avg_rating * (updated_count - 1) as f32) + new_rating_value) / updated_count as f32
    } else {
        new_rating_value
    };

    // stories 테이블 업데이트
    match sqlx::query("UPDATE stories SET rating = $1, success_count = $2 WHERE id = $3")
        .bind(updated_rating)
        .bind(updated_count)
        .bind(story.id)
        .execute(&mut tx)
        .await
    {
        Ok(_) => (),
        Err(_) => return HttpResponse::InternalServerError().body("Error updating story"),
    }

    // 트랜잭션 커밋
    if let Err(_) = tx.commit().await {
        return HttpResponse::InternalServerError().body("Transaction commit error");
    }

    HttpResponse::Ok().body(format!(
        "New average rating for today's story is {:.2} with {} success counts",
        updated_rating, updated_count
    ))
}
