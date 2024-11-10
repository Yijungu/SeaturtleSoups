use actix_web::{get, post, web, HttpResponse, Responder};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::env;

#[derive(Deserialize)]
struct NaverTokenRequest {
    access_token: String,
}

#[derive(Deserialize)]
struct NaverUserInfo {
    response: NaverUserResponse,
}

#[derive(Deserialize)]
struct NaverUserResponse {
    id: String,
    email: String,
}

#[derive(Serialize, Deserialize)]
struct Claims {
    id: String,
    email: String,
    exp: usize, // 만료 시간 (Epoch time)
}

#[post("/login/naver")]
async fn login_with_naver(body: web::Json<NaverTokenRequest>) -> impl Responder {
    let client = Client::new();

    // 네이버 API에서 사용자 정보 가져오기
    let user_info = match client
        .get("https://openapi.naver.com/v1/nid/me")
        .header("Authorization", format!("Bearer {}", body.access_token))
        .send()
        .await
    {
        Ok(response) => {
            if !response.status().is_success() {
                return HttpResponse::BadRequest().body("Failed to fetch user info from Naver");
            }
            match response.json::<NaverUserInfo>().await {
                Ok(info) => info,
                Err(err) => {
                    eprintln!("Error parsing user info: {:?}", err);
                    return HttpResponse::BadRequest().body("Invalid user info from Naver");
                }
            }
        }
        Err(err) => {
            eprintln!("Error sending request to Naver API: {:?}", err);
            return HttpResponse::BadRequest().body("Failed to fetch user info from Naver");
        }
    };

    // 허용된 이메일 목록 검사
    let allowed_emails: HashSet<&str> = ["wnsrn4970@naver.com"].iter().cloned().collect();
    if !allowed_emails.contains(user_info.response.email.as_str()) {
        return HttpResponse::Unauthorized().body("Unauthorized email");
    }

    // JWT 만료 시간 설정 (1시간 후)
    let expiration = chrono::Utc::now()
        .checked_add_signed(chrono::Duration::hours(1))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        id: user_info.response.id.clone(),
        email: user_info.response.email.clone(),
        exp: expiration,
    };

    let secret_key = env::var("JWT_SECRET").expect("JWT_SECRET must be set");

    // JWT 생성
    let token = match encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret_key.as_ref()),
    ) {
        Ok(t) => t,
        Err(_) => return HttpResponse::InternalServerError().body("Failed to generate token"),
    };

    HttpResponse::Ok().json(token)
}

#[get("/verify")]
async fn verify_jwt(token: web::Query<String>) -> impl Responder {
    let secret_key = env::var("JWT_SECRET").expect("JWT_SECRET must be set");

    // JWT 검증
    let token_data = match decode::<Claims>(
        &token.into_inner(),
        &DecodingKey::from_secret(secret_key.as_ref()),
        &Validation::default(),
    ) {
        Ok(data) => data,
        Err(_) => return HttpResponse::Unauthorized().body("Invalid token"),
    };

    HttpResponse::Ok().json(token_data.claims)
}
