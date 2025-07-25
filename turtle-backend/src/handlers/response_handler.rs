use actix_web::{get, web, HttpResponse, Responder};
use chrono::{Duration, NaiveDate, NaiveDateTime};
use serde::Serialize;
use sqlx::{FromRow, PgPool};

// 데이터베이스에서 가져올 응답 모델 정의
#[derive(Serialize, FromRow)]
pub struct Response {
    pub id: i32,
    pub question: String,
    pub response: String,
    pub created_at: NaiveDateTime,
}

// 특정 날짜의 응답을 가져오는 핸들러 함수
#[get("/responses/{date}")]
async fn get_responses_by_date(
    pool: web::Data<PgPool>, // PostgreSQL 연결 풀
    path: web::Path<String>, // 경로로부터 날짜 문자열 가져오기
) -> impl Responder {
    let date_str = path.into_inner();

    // 문자열을 날짜 형식으로 파싱 (yyyy-MM-dd 형식 가정)
    let parsed_date = match NaiveDate::parse_from_str(&date_str, "%Y-%m-%d") {
        Ok(date) => date,
        Err(_) => return HttpResponse::BadRequest().body("Invalid date format"),
    };

    // 다음 날 계산하여 범위 조건으로 조회
    let next_day = parsed_date
        .succ_opt()
        .unwrap_or(parsed_date + chrono::Duration::days(1));

    let query = "SELECT * FROM responses WHERE created_at >= $1 AND created_at < $2";
    let responses: Vec<Response> = match sqlx::query_as::<_, Response>(query)
        .bind(parsed_date)
        .bind(next_day)
        .fetch_all(pool.get_ref())
        .await
    {
        Ok(result) => result,
        Err(_) => return HttpResponse::InternalServerError().body("Database error"),
    };

    // JSON 형식으로 응답 반환
    HttpResponse::Ok().json(responses)
}
