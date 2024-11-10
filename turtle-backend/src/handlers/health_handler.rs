use actix_web::{get, HttpResponse, Responder};

// OpenAI 핸들러 예시
#[get("/")]
pub async fn health_check() -> impl Responder {
    HttpResponse::Ok().body("OK")
}