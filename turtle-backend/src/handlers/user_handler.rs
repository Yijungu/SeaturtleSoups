use actix_web::{post, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use chrono::{Utc, Local};
use rand::{distributions::Alphanumeric, Rng};
use bcrypt::{hash, DEFAULT_COST, verify};

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub user_id: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct FindUsernameRequest {
    pub security_code: String,
}

#[derive(Debug, Deserialize)]
pub struct PasswordRecoveryRequest {
    pub user_id: String,
    pub security_code: String,
}


#[derive(Debug, Deserialize)]
pub struct CheckUsernameRequest {
    pub user_id: String, // 클라이언트에서 전달받는 아이디
}

#[derive(Debug, Deserialize)]
pub struct NewUser {
    pub user_id: String,
    pub username: String,
    pub password: String, // 비밀번호를 직접 받음
}

#[derive(Debug, Deserialize)]
pub struct PasswordChangeRequest {
    pub user_id: String,        // 사용자 아이디
    pub security_code: String, // 보안 코드
    pub new_password: String,  // 새 비밀번호
}

/// 아이디 중복 여부를 확인하는 API 핸들러
#[post("/users/check-username")]
async fn check_username_duplicate(
    pool: web::Data<PgPool>,
    query: web::Json<CheckUsernameRequest>,
) -> impl Responder {
    let result = sqlx::query!(
        "SELECT EXISTS (SELECT 1 FROM users WHERE user_id = $1) AS exists",
        query.user_id
    )
    .fetch_one(pool.get_ref())
    .await;

    match result {
        Ok(record) => HttpResponse::Ok().json(record.exists.unwrap_or(false)), // 중복 여부 반환
        Err(e) => {
            eprintln!("Error checking username: {}", e);
            HttpResponse::InternalServerError().body("Failed to check username")
        }
    }
}

/// 사용자를 삽입하는 API 핸들러
#[post("/users")]
async fn insert_user(
    pool: web::Data<PgPool>,
    new_user: web::Json<NewUser>,
) -> impl Responder {
    // 현재 한국 시간 가져오기
    let created_at = Local::now().naive_local();

    // 보안 코드 생성 (8자리 랜덤 문자열)
    let security_code: String = rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(15)
        .map(char::from)
        .collect();

    // 유니크한 discriminator 생성
    let mut discriminator: i32;
    loop {
        discriminator = rand::thread_rng().gen_range(1000..=9999);

        // 닉네임과 discriminator 조합의 고유성 확인
        let is_unique = sqlx::query!(
            "SELECT EXISTS (SELECT 1 FROM users WHERE user_id = $1 AND discriminator = $2) AS exists",
            new_user.user_id,
            discriminator
        )
        .fetch_one(pool.get_ref())
        .await;

        match is_unique {
            Ok(record) if !record.exists.unwrap_or(false) => break, // 고유하다면 loop 종료
            Ok(_) => continue, // 고유하지 않으면 새로운 discriminator 생성
            Err(e) => {
                eprintln!("Error checking discriminator uniqueness: {}", e);
                return HttpResponse::InternalServerError().body("Failed to generate unique discriminator");
            }
        }
    }

    // 비밀번호 해싱
    let hashed_password = match hash(&new_user.password, DEFAULT_COST) {
        Ok(hashed) => hashed,
        Err(e) => {
            eprintln!("Error hashing password: {}", e);
            return HttpResponse::InternalServerError().body("Failed to hash password");
        }
    };

    let result = sqlx::query!(
        "INSERT INTO users (user_id, username, discriminator, password_hash, security_code, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, security_code, discriminator",
        new_user.user_id,
        new_user.username,
        discriminator,
        hashed_password,
        security_code,
        created_at
    )
    .fetch_one(pool.get_ref())
    .await;

    match result {
        Ok(record) => HttpResponse::Ok().json(serde_json::json!({
            "user_id": record.user_id,
            "security_code": record.security_code,
            "discriminator": record.discriminator
        })), // 생성된 사용자 ID, 보안 코드, 그리고 discriminator 반환
        Err(e) => {
            eprintln!("Error inserting user: {}", e);
            HttpResponse::InternalServerError().body("Failed to create user")
        }
    }
}


#[post("/login")]
async fn login(
    pool: web::Data<PgPool>,
    login_request: web::Json<LoginRequest>,
) -> impl Responder {
    let result = sqlx::query!(
        "SELECT password_hash FROM users WHERE user_id = $1",
        login_request.user_id
    )
    .fetch_one(pool.get_ref())
    .await;

    match result {
        Ok(record) => {
            let password_match = verify(&login_request.password, &record.password_hash)
                .unwrap_or(false);

            if password_match {
                HttpResponse::Ok().body("Login successful")
            } else {
                HttpResponse::Unauthorized().body("Invalid password")
            }
        }
        Err(_) => HttpResponse::NotFound().body("Username not found"),
    }
}

#[post("/recover-password")]
async fn recover_password(
    pool: web::Data<PgPool>,
    recovery_request: web::Json<PasswordRecoveryRequest>,
) -> impl Responder {
    let result = sqlx::query!(
        "SELECT security_code FROM users WHERE user_id = $1",
        recovery_request.user_id
    )
    .fetch_one(pool.get_ref())
    .await;

    match result {
        Ok(record) => {
            if record.security_code == recovery_request.security_code {
                HttpResponse::Ok().json(true) // 일치하면 true 반환
            } else {
                HttpResponse::Ok().json(false) // 일치하지 않으면 false 반환
            }
        }
        Err(_) => HttpResponse::Ok().json(false), // 사용자 ID를 찾을 수 없으면 false 반환
    }
}

#[post("/find-username")]
async fn find_username(
    pool: web::Data<PgPool>,
    request: web::Json<FindUsernameRequest>,
) -> impl Responder {
    let result = sqlx::query!(
        "SELECT user_id FROM users WHERE security_code = $1",
        request.security_code
    )
    .fetch_one(pool.get_ref())
    .await;

    match result {
        Ok(record) => HttpResponse::Ok().json(record.user_id),
        Err(_) => HttpResponse::NotFound().body("No username found for the provided security code"),
    }
}


#[post("/change-password")]
async fn change_password(
    pool: web::Data<PgPool>,
    request: web::Json<PasswordChangeRequest>,
) -> impl Responder {
    // 입력된 새 비밀번호 해싱
    let hashed_password = match hash(&request.new_password, DEFAULT_COST) {
        Ok(hashed) => hashed,
        Err(e) => {
            eprintln!("Error hashing new password: {}", e);
            return HttpResponse::InternalServerError().body("Failed to hash new password");
        }
    };

    // 데이터베이스에서 사용자와 보안 코드를 확인하고 비밀번호 변경
    let result = sqlx::query!(
        "UPDATE users 
         SET password_hash = $1 
         WHERE user_id = $2 AND security_code = $3 
         RETURNING user_id",
        hashed_password,
        request.user_id,
        request.security_code
    )
    .fetch_one(pool.get_ref())
    .await;

    // 결과 처리
    match result {
        Ok(record) => HttpResponse::Ok().body(format!(
            "Password changed successfully for user_id: {}",
            record.user_id
        )),
        Err(sqlx::Error::RowNotFound) => {
            HttpResponse::Unauthorized().body("Invalid user ID or security code")
        }
        Err(e) => {
            eprintln!("Error changing password: {}", e);
            HttpResponse::InternalServerError().body("Failed to change password")
        }
    }
}