use actix_web::{post, web, HttpResponse, Responder};
use sqlx::PgPool;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct NewComplaint {
    pub description: String, // 요청 바디로 들어오는 불만 사항
}

#[post("/complaints")]
async fn create_complaint(
    pool: web::Data<PgPool>, 
    new_complaint: web::Json<NewComplaint>
) -> impl Responder {
    let result = sqlx::query!(
        "INSERT INTO complaints (description) VALUES ($1) RETURNING id",
        new_complaint.description
    )
    .fetch_one(pool.get_ref())
    .await;

    match result {
        Ok(record) => HttpResponse::Ok().json(record.id), // 생성된 ID를 반환
        Err(e) => {
            eprintln!("Error inserting complaint: {}", e);
            HttpResponse::InternalServerError().body("Failed to create complaint")
        }
    }
}
