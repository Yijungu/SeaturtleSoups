// src/handlers.rs
use actix_web::{get, post, web, HttpResponse, Responder};
use std::sync::Arc;
use crate::models::SharedRating; 

#[post("/rating")]
pub async fn add_rating(
    rating: web::Data<SharedRating>,
    new_rating: web::Json<f32>, // 새로운 평점만 받음
) -> impl Responder {
    let new_rating_value = new_rating.into_inner();
    let mut rating = rating.lock().await;

    // 평균과 명수 업데이트
    rating.count += 1;
    rating.average = ((rating.average * (rating.count - 1) as f32) + new_rating_value) 
                      / rating.count as f32;

    HttpResponse::Ok().body(format!(
        "New average rating is {:.2} with {} ratings",
        rating.average, rating.count
    ))
}
