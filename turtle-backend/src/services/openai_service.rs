use crate::models::Story;
use aws_config::{self, BehaviorVersion, Region};
use aws_sdk_secretsmanager::Client as AwsClient;
use reqwest::{Client, StatusCode};
use serde::{Deserialize, Serialize};
use serde_json::json;
use serde_json::Value;
use std::sync::Arc;
use thiserror::Error;
use tokio::sync::Mutex;

/// Custom error for handling OpenAI and AWS-related failures.
#[derive(Error, Debug)]
pub enum OpenAIError {
    #[error("Missing OPENAI_API_KEY in environment")]
    MissingApiKey(#[from] std::env::VarError),

    #[error("Failed to retrieve secret from AWS: {0}")]
    SecretRetrievalError(Box<dyn std::error::Error + Send + Sync>),

    #[error("Failed to send request to OpenAI: {0}")]
    RequestError(#[from] reqwest::Error),

    #[error("Received unexpected status code: {0}")]
    UnexpectedStatus(StatusCode),

    #[error("OpenAI API Error: {0}")]
    ApiError(String),

    #[error("OpenAI response is empty or malformed")]
    EmptyResponse,
}

#[derive(Serialize)]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Serialize)]
struct ChatRequest {
    model: String,
    messages: Vec<ChatMessage>,
    max_tokens: u32,
    temperature: f32,
}

#[derive(Deserialize, Debug)]
pub struct ChatResponse {
    pub choices: Vec<Choice>,
}

#[derive(Deserialize, Debug)]
pub struct Choice {
    pub message: ChatMessageContent,
}

#[derive(Deserialize, Debug)]
pub struct ChatMessageContent {
    pub content: String,
}

/// Retrieves the OpenAI API key from AWS Secrets Manager or environment variables based on the environment.
pub async fn get_openai_api_key() -> Result<String, OpenAIError> {
    // if cfg!(debug_assertions) {
    //     dotenv().ok();
    //     env::var("OPENAI_API_KEY").map_err(OpenAIError::MissingApiKey)
    // } else {
    get_secret_key_from_aws("OPENAI_API_KEY").await
    // }
}

/// Retrieves a specific key (e.g., OPENAI_API_KEY) from AWS Secrets Manager.
pub async fn get_secret_key_from_aws(key_name: &str) -> Result<String, OpenAIError> {
    let secret_name = "turtle-backend-secrets";
    let region = Region::new("ap-northeast-2");

    // Load AWS configuration
    let config = aws_config::defaults(BehaviorVersion::v2024_03_28())
        .region(region)
        .load()
        .await;

    // Initialize the AWS Secrets Manager client
    let asm = AwsClient::new(&config);

    // Send the request to get the secret value
    let response = asm
        .get_secret_value()
        .secret_id(secret_name)
        .send()
        .await
        .map_err(|e| OpenAIError::SecretRetrievalError(Box::new(e)))?;

    // Extract the secret string from the response
    let secret_string = response
        .secret_string()
        .ok_or_else(|| OpenAIError::ApiError("Secret string not found".into()))?;

    // Parse the secret as JSON to extract the desired key
    let secret_json: Value = serde_json::from_str(&secret_string)
        .map_err(|e| OpenAIError::ApiError(format!("Failed to parse JSON: {}", e)))?;

    // Retrieve the specific key value (e.g., "OPENAI_API_KEY") from the JSON
    secret_json
        .get(key_name)
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .ok_or_else(|| OpenAIError::ApiError(format!("Key {} not found", key_name)))
}

pub async fn call_openai_with_memory(
    prompt_input: &str,
    question: &str,
    answer: &str,
    background: Option<&str>,
) -> Result<String, OpenAIError> {

    // OpenAI API 키 가져오기
    let api_key = get_openai_api_key().await?;
    let client = Client::new();

    async fn send_request(
        client: &Client,
        api_key: &str,
        model: &str,
        system_content: &str,
        backgroud_content: &str,
        user_content: &str,
    ) -> Result<String, OpenAIError> {
        println!("background : {}", backgroud_content);
        let request_body = json!({
            "model": model,
            "messages": [
                { "role": "system", "content": system_content },
                {
                    "role": "user",
                    "content": "이 이야기를 보고 밝혀낼 수 있는 비밀을 확실히 알아내 짧게 말해보세요."
                },
                {
                    "role": "assistant",
                    "content": format!(
                        "{}",
                        backgroud_content,
                    )},
                {"role": "user", "content": format!(
                    "질문 : {}. 질문들 안에 있는 단어들의 의미를 하나한 정확히 이해한 뒤 위의 밝혀진 비밀이 진실이라고 생각한 뒤 대답해봐",
                    user_content,
                )}
            ],
            "max_tokens": 100,
            "temperature": 0.0
        });

        let response = client
            .post("https://api.openai.com/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", api_key))
            .json(&request_body)
            .send()
            .await?;

        if response.status() != StatusCode::OK {
            return Err(OpenAIError::UnexpectedStatus(response.status()));
        }

        let response_body: ChatResponse = response.json().await?;
        let result = response_body
            .choices
            .get(0)
            .map(|choice| choice.message.content.clone())
            .ok_or(OpenAIError::EmptyResponse)?;

        Ok(result)
    }

    async fn send_request_importance(
        client: &Client,
        api_key: &str,
        model: &str,
        system_content: &str,
        user_content: &str,
    ) -> Result<String, OpenAIError> {
        let request_body = json!({
            "model": model,
            "messages": [
                { "role": "system", "content": system_content },
                {"role": "user", "content": format!(
                    "이야기의 핵심을 알아내세요."
                )},
                {"role": "user", "content": format!(
                    "질문이 이야기의 핵심을 짚는 지 판단하여 중요도를 설정해주세요. {}",
                    user_content,
                )}
            ],
            "max_tokens": 100,
            "temperature": 0.0
        });

        let response = client
            .post("https://api.openai.com/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", api_key))
            .json(&request_body)
            .send()
            .await?;

        if response.status() != StatusCode::OK {
            return Err(OpenAIError::UnexpectedStatus(response.status()));
        }

        let response_body: ChatResponse = response.json().await?;
        let result = response_body
            .choices
            .get(0)
            .map(|choice| choice.message.content.clone())
            .ok_or(OpenAIError::EmptyResponse)?;

        Ok(result)
    }

    // 첫 번째와 두 번째 요청의 설정과 요청 실행
    let model = "gpt-4o-mini-2024-07-18";
    let system_message = format!(
        "당신은 바다거북수프 게임의 사회자입니다. 다음에 문제와 이야기가 주어집니다.\n\n문제: {}\n부분 이야기: {}\n\n
        질문 속 모든 단어들의 정의를 엄격히 재단하세요.
        그런 다음 질문의 의미가 이야기와 완벽히 일치되는지 정확히 판단하세요. 
        모든 단어들의 의미가 완벽히 들어맞아야 합니다. 예를 들어, 사진은 그림을 뜻하지 않고 사진기를 통해서 찍은 사진만을 뜻합니다.
        질문에 답을 '네.' 또는 '아니오.' 또는 '확실히 모르겠습니다.' 로 제공하세요. 추가적인 설명은 하지 마세요.",
        question, answer
    );

    let second_result = send_request(
        &client,
        &api_key,
        model,
        &system_message,
        background.as_deref().unwrap_or(""),
        &format!("질문 : {}", prompt_input),
    )
    .await?;

    // 중요도를 평가하는 마지막 요청
    let importance_message = format!(
        "당신은 바다거북수프 게임의 사회자입니다. 다음에 문제와 이야기가 주어집니다.\n\n문제: {}\n부분 이야기: {}\n\n당신의 임무는 다음과 같습니다:\n\n1. 질문 속 모든 단어들의 정의를 엄격히 재단하세요. 그런 다음 질문의 의미가 이야기와 완벽히 일치되는지 정확히 판단하세요. 모든 단어들의 의미가 완벽히 들어맞아야 합니다. 예를 들어, 사진은 그림을 뜻하지 않고 사진기를 통해서 찍은 사진만을 뜻합니다. \n2. 부분 이야기를 깊이 있게 분석하여 부분 이야기에는 나와있지 않은 숨겨진 진실과 배경을 알아내세요. 알아낸 것을 토대로 하나의 전체 이야기를 완성하세요.\n3. 주어진 질문이 네 아니오로 명확하게 답을 제공할 수 있는 질문인지 판단하세요.\n4. 주어진 질문이 이야기의 핵심을 짚는 지 판단하세요.\n5. 위의 단계들을 따라 질문의 중요도를 정확하게 평가해주세요. 답을 '질문의 중요도 : ?점' 으로만 제공하세요. 절대로 추가적인 설명이나 정보는 제공하지 마세요.",
        question, answer
    );

    let initial_result =
        send_request_importance(&client, &api_key, model, &importance_message, &prompt_input)
            .await?;

    let final_response = format!("{}    [{}]", second_result, initial_result);
    Ok(final_response)
}

pub async fn call_openai_with_memory_answer(
    prompt_input: &str,
    question: &str,
    answer: &str,
    background: Option<&str>,
) -> Result<String, OpenAIError> {
    // 메모리에서 스토리 가져오기
    // OpenAI API 키 가져오기
    let api_key = get_openai_api_key().await?;
    let client = Client::new();

    async fn send_request(
        client: &Client,
        api_key: &str,
        system_content: &str,
        background_content: &str,
        user_content: &str,
    ) -> Result<String, OpenAIError> {
        let request_body = json!({
            "model": "gpt-4o-mini-2024-07-18",
            "messages": [
                { "role": "system", "content": system_content },
                { "role": "user", "content": "이야기의 핵심을 알아내세요." },
                {
                    "role": "assistant",
                    "content": format!(
                        "{}",
                        background_content,
                    )},
                { "role": "user", "content": user_content }
            ],
            "max_tokens": 100,
            "temperature": 0.0
        });

        let response = client
            .post("https://api.openai.com/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", api_key))
            .json(&request_body)
            .send()
            .await?;

        if response.status() != StatusCode::OK {
            return Err(OpenAIError::UnexpectedStatus(response.status()));
        }

        let response_body: ChatResponse = response.json().await?;
        let result = response_body
            .choices
            .get(0)
            .map(|choice| choice.message.content.clone())
            .ok_or(OpenAIError::EmptyResponse)?;

        Ok(result)
    }

    let system_message = format!(
        "당신은 바다거북수프 게임의 사회자입니다.\n\n문제: {}\n\n부분 이야기: {}\n\n당신의 임무는 다음과 같습니다:\n\n1. 부분 이야기를 깊이 있게 분석하여 부분 이야기에는 나와있지 않은 숨겨진 배경과 문제에 대한 답을 알아내세요.\n2 주어진 정답 속 모든 단어들의 정의를 엄격히 재단하세요. 그런 다음 정답의 의미가 이야기와 완벽히 일치되는지 정확히 판단하세요.\n3. 1번에서 알아낸 답이 들어가있는 지 입력으로 들어온 정답에 들어있는 지 판단하세요. 위의 단계들을 통해 주어진 정답을 맞는 지를 판단하세요. 답은 '맞습니다.' 또는 '틀립니다.'로 제공하세요. 추가적인 설명이나 정보는 제공하지 마세요.",
        question,
        answer
    );

    let first_result = send_request(
        &client,
        &api_key,
        &system_message,
        background.as_deref().unwrap_or(""),
        &format!(
            "정확히 이야기의 핵심이 들어가 있는지 판단해주세요. {}",
            prompt_input
        ),
    )
    .await?;
    let second_result = send_request(
        &client,
        &api_key,
        &system_message,
        background.as_deref().unwrap_or(""),
        &format!(
            "알아낸 이야기의 핵심을 토대로 사실 여부를 판단해주세요. {}",
            prompt_input
        ),
    )
    .await?;

    // 결과에 따른 응답 처리
    if first_result.contains("맞습니다") && second_result.contains("맞습니다") {
        return Ok(format!("맞습니다."));
    } else {
        return Ok(format!("틀립니다."));
    }
}

pub async fn fetch_background_from_openai(
    question_content: &str,
    answer_content: &str,
) -> Result<String, OpenAIError> {
    let api_key = get_openai_api_key().await?;
    let client = Client::new();

    let request_body = json!({
        "model": "gpt-4o-mini-2024-07-18",
        "messages": [
            { "role": "system", "content": format!(
                "당신은 바다거북수프 게임의 사회자입니다. 다음에 문제와 이야기가 주어집니다.\n\n문제: {}\n부분 이야기: {}\n\n당신의 임무는 다음과 같습니다:\n\n1. 부분 이야기를 깊이 있게 분석하여 부분 이야기에는 나와있지 않은 숨겨진 진실과 배경을 알아내세요. 알아낸 것을 토대로 하나의 전체 이야기를 이해하세요."
                , question_content, answer_content
            ) },
            {"role": "user", "content": format!(
                "이 이야기를 보고 밝혀낼 수 있는 비밀을 확실히 알아내 짧게 말해보세요."
            )}
        ],
        "max_tokens": 1000,
        "temperature": 0.0
    });

    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&request_body)
        .send()
        .await?;

    if response.status() != StatusCode::OK {
        return Err(OpenAIError::UnexpectedStatus(response.status()));
    }

    let response_body: ChatResponse = response.json().await?;
    let result = response_body
        .choices
        .get(0)
        .map(|choice| choice.message.content.clone())
        .ok_or(OpenAIError::EmptyResponse)?;

    Ok(result)
}
