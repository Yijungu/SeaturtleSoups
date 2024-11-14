// src/handlers.rs
use actix_web::{post, web, HttpResponse, Responder};
use chrono::Utc;
use sqlx::PgPool;
use crate::models::Story;

#[post("/rating")]
pub async fn add_rating(
    pool: web::Data<PgPool>,
    rating_data: web::Json<(i32, f32)>, // Receives a tuple with (id, new_rating)
) -> impl Responder {
    let (story_id, new_rating_value) = rating_data.into_inner();

    // Start a transaction
    let mut tx = match pool.begin().await {
        Ok(tx) => tx,
        Err(_) => return HttpResponse::InternalServerError().body("Transaction start error"),
    };

    // Retrieve the Story by id
    let story = match sqlx::query_as::<_, Story>("SELECT * FROM stories WHERE id = $1")
        .bind(story_id)
        .fetch_optional(&mut tx)
        .await
    {
        Ok(Some(story)) => story,
        Ok(None) => return HttpResponse::NotFound().body("Story not found for the given ID"),
        Err(_) => return HttpResponse::InternalServerError().body("Error fetching story"),
    };

    // Calculate the new rating and increment success_count
    let updated_count = story.success_count.unwrap_or(0) + 1;
    let updated_rating = if let Some(avg_rating) = story.rating {
        ((avg_rating * (updated_count - 1) as f32) + new_rating_value) / updated_count as f32
    } else {
        new_rating_value
    };

    // Update the stories table with the new rating and success_count
    match sqlx::query("UPDATE stories SET rating = $1, success_count = $2 WHERE id = $3")
        .bind(updated_rating)
        .bind(updated_count)
        .bind(story_id)
        .execute(&mut tx)
        .await
    {
        Ok(_) => (),
        Err(_) => return HttpResponse::InternalServerError().body("Error updating story"),
    }

    // Commit the transaction
    if let Err(_) = tx.commit().await {
        return HttpResponse::InternalServerError().body("Transaction commit error");
    }

    HttpResponse::Ok().body(format!(
        "New average rating for story with ID {} is {:.2} with {} success counts",
        story_id, updated_rating, updated_count
    ))
}