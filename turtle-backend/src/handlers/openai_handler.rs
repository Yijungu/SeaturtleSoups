use crate::services::openai_service::call_openai_with_memory;
use crate::services::openai_service::call_openai_with_memory_answer;
use serde::Deserialize;
use actix_web::{post, web, HttpResponse, Responder};
use std::sync::Arc;
use tokio::sync::Mutex;
use crate::models::{Story, Response};

pub type ResponseQueue = Arc<Mutex<Vec<Response>>>;
pub type StoryData = Arc<Mutex<Vec<Story>>>;

#[derive(Deserialize)]
struct QuestionPayload {
    data: String,       // "data" field for the prompt
    question: String,   // Additional question text
    answer: String,     // Expected answer
    background: Option<String>, // Optional background information
}
#[post("/openai")]
async fn openai_handler(
    payload: web::Json<QuestionPayload>,
    response_queue: web::Data<ResponseQueue>,
) -> impl Responder {
    let prompt = payload.data.clone();
    let question = payload.question.clone();
    let answer = payload.answer.clone();
    let background = payload.background.clone();
    if prompt.is_empty() {
        return HttpResponse::BadRequest().body("Prompt cannot be empty");
    }

    match call_openai_with_memory(&prompt, &question, &answer, background.as_deref()).await {
        Ok(response) => {
            let mut queue = response_queue.lock().await;
            queue.push(Response {
                id: None,
                question: prompt.clone(),
                response: response.clone(),
                created_at: None,
            });

            HttpResponse::Ok().body(response)
        }
        Err(err) => {
            eprintln!("Error during OpenAI API call: {}", err);
            HttpResponse::InternalServerError().body(format!("Error: {}", err))
        }
    }
}

#[post("/openai/answer")]
async fn openai_handler_answer(
    payload: web::Json<QuestionPayload>,
    response_queue: web::Data<ResponseQueue>,
) -> impl Responder {
    let prompt = payload.data.clone();
    let question = payload.question.clone();
    let answer = payload.answer.clone();
    let background = payload.background.clone();

    if prompt.is_empty() {
        return HttpResponse::BadRequest().body("Prompt cannot be empty");
    }

    match call_openai_with_memory_answer(&prompt, &question, &answer, background.as_deref()).await {
        Ok(response) => {
            // 비동기적 잠금 사용
            let mut queue = response_queue.lock().await;
            queue.push(Response {
                id: None,
                question: prompt.clone(),
                response: response.clone(),
                created_at: None,
            });

            HttpResponse::Ok().body(response)
        }
        Err(err) => {
            eprintln!("Error during OpenAI API call: {}", err); // 에러 로그
            HttpResponse::InternalServerError().body(format!("Error: {}", err))
        }
    }
}
