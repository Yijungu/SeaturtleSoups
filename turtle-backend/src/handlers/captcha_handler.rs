use actix_web::{get, post, web, HttpResponse, Responder};
use captcha::{filters::Wave, Captcha};
use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

#[derive(Debug, Clone)]
pub struct CaptchaStore {
    store: Arc<Mutex<HashMap<String, String>>>, // 키: 클라이언트 식별자, 값: CAPTCHA 문자열
}

impl CaptchaStore {
    pub fn new() -> Self {
        CaptchaStore {
            store: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn set(&self, client_id: &str, captcha: &str) {
        let mut store = self.store.lock().unwrap();
        store.insert(client_id.to_string(), captcha.to_string());
    }

    pub fn get(&self, client_id: &str) -> Option<String> {
        let store = self.store.lock().unwrap();
        store.get(client_id).cloned()
    }

    pub fn delete(&self, client_id: &str) {
        let mut store = self.store.lock().unwrap();
        store.remove(client_id);
    }
}

#[derive(Debug, Serialize)]
pub struct CaptchaResponse {
    pub client_id: String,
    pub captcha_image: String,
}

/// CAPTCHA 생성 API 핸들러
#[get("/generate-captcha")]
async fn generate_captcha(store: web::Data<CaptchaStore>) -> impl Responder {
    // CAPTCHA 이미지 생성
    let mut captcha = Captcha::new();
    captcha
        .add_chars(6) // 6자리 랜덤 문자 추가
        .apply_filter(Wave::new(3.0, 10.0).horizontal())
        .view(220, 80);

    // CAPTCHA 텍스트 가져오기
    let captcha_text = captcha.chars_as_string();

    // 이미지 데이터를 Base64로 인코딩
    let captcha_image = base64::encode(&captcha.as_png().unwrap());

    // 클라이언트 식별자 생성
    let client_id: String = thread_rng()
        .sample_iter(&Alphanumeric)
        .take(16)
        .map(char::from)
        .collect();

    // CAPTCHA 저장
    store.set(&client_id, &captcha_text);

    // JSON 응답으로 반환
    HttpResponse::Ok().json(CaptchaResponse {
        client_id,
        captcha_image: format!("data:image/png;base64,{}", captcha_image)
    })
}

#[derive(Debug, Deserialize)]
pub struct ValidateCaptchaRequest {
    pub client_id: String,
    pub captcha_input: String,
}

/// CAPTCHA 검증 API 핸들러
#[post("/validate-captcha")]
async fn validate_captcha(
    store: web::Data<CaptchaStore>,
    request: web::Json<ValidateCaptchaRequest>,
) -> impl Responder {
    let client_id = &request.client_id;
    let captcha_input = &request.captcha_input;

    if let Some(expected_captcha) = store.get(client_id) {
        if captcha_input == &expected_captcha {
            // CAPTCHA가 일치하면 삭제
            store.delete(client_id);
            return HttpResponse::Ok().body("Captcha validated successfully");
        }
    }

    HttpResponse::Unauthorized().body("Invalid CAPTCHA")
}
