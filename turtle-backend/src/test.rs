use dotenv::dotenv;
use reqwest::{Client, StatusCode};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::env;
use std::fs::File;
use std::io::{self, BufRead};
use std::path::Path;
use std::sync::Arc;
use tokio::sync::Mutex;
use regex::Regex;

#[derive(Clone, Debug)]
struct Story {
    question: String,
    answer: String,
}

#[derive(Clone, Debug)]
struct Prompt {
    question: String,
    expected_answer: Option<String>, // 예상 답변을 Optional로 처리
}

// ChatResponse 구조체 정의 (오류 해결)
#[derive(Debug, Deserialize)]
struct ChatResponse {
    choices: Vec<Choice>,
}

#[derive(Debug, Deserialize)]
struct Choice {
    message: ChatMessageContent,
}

#[derive(Debug, Deserialize)]
struct ChatMessageContent {
    content: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok(); // .env 파일에서 환경 변수 로드
    let api_key = get_openai_api_key()?;

    // Story 및 prompt 데이터 로드
    let (story, prompts_question, prompts_answer) = load_story_and_prompts("story_data.txt")?;
    let story_data = Arc::new(Mutex::new(vec![story]));

    let client = Client::new();
    let mut n = 0;

    println!("=======================질문 테스트==========================");
    for (i, prompt) in prompts_question.iter().enumerate() {
        match call_openai_with_memory(&client, &api_key, &prompt.question, story_data.clone()).await {
            Ok(response) => {
                if let Some(expected) = &prompt.expected_answer {
                    if &response == expected {
                        println!("✅ 테스트 성공 - 프롬프트 {}: 예상한 답변 '{}'과 일치합니다.", &prompt.question, expected);
                        n += 1;
                    } else {
                        println!("❌ 테스트 실패 - 프롬프트 {}: 예상 답변 '{}'과 실제 답변 '{}'이 일치하지 않습니다.",  &prompt.question, expected, response);
                    }
                } else {
                    println!("❓ 예상 답변이 지정되지 않은 프롬프트 {}: 응답 확인 필요", i + 1);
                }
            },
            Err(e) => eprintln!("⚠️ 'call_openai_with_memory' 함수 오류 (프롬프트 {}): {}", i + 1, e),
        }
    }

    let success_rate = (n as f64 / prompts_question.len() as f64) * 100.0;
    println!("✅ 질문 테스트 성공률: {:.2}%", success_rate);

    // println!("=======================정답 테스트==========================");
    // n = 0;
    // for (i, prompt) in prompts_answer.iter().enumerate() {
    //     match call_openai_with_memory_answer(&client, &api_key, &prompt.question, story_data.clone()).await {
    //         Ok(response) => {
    //             if let Some(expected) = &prompt.expected_answer {
    //                 if &response == expected {
    //                     println!("✅ 테스트 성공 - 프롬프트 {}: 예상한 답변 '{}'과 일치합니다.", &prompt.question, expected);
    //                     n += 1;
    //                 } else {
    //                     println!("❌ 테스트 실패 - 프롬프트 {}: 예상 답변 '{}'과 실제 답변 '{}'이 일치하지 않습니다.", &prompt.question, expected, response);
    //                 }
    //             } else {
    //                 println!("❓ 예상 답변이 지정되지 않은 프롬프트 {}: 응답 확인 필요", i + 1);
    //             }
    //         },
    //         Err(e) => eprintln!("⚠️ 'call_openai_with_memory_answer' 함수 오류 (프롬프트 {}): {}", i + 1, e),
    //     }
    // }

    // let success_rate = (n as f64 / prompts_answer.len() as f64) * 100.0;
    // println!("✅ 정답 테스트 성공률: {:.2}%", success_rate);

    Ok(())
}

fn get_openai_api_key() -> Result<String, Box<dyn std::error::Error>> {
    env::var("OPENAI_API_KEY").map_err(|e| Box::new(e) as Box<dyn std::error::Error>)
}

fn load_story_and_prompts(filename: &str) -> Result<(Story, Vec<Prompt>, Vec<Prompt>), io::Error> {
    let file = File::open(filename)?;
    let reader = io::BufReader::new(file);
    let mut question = String::new();
    let mut answer = String::new();
    let mut prompts_question = Vec::new();
    let mut prompts_answer = Vec::new();

    for line in reader.lines() {
        let line = line?;
        if line.starts_with("question:") {
            question = line["question:".len()..].trim().to_string();
        } else if line.starts_with("answer:") {
            answer = line["answer:".len()..].trim().to_string();
        } else if line.starts_with("prompt_question") {
            let prompt_text = line.split_once(':').map(|(_, p)| p.trim().to_string()).unwrap_or_default();
            prompts_question.push(Prompt {
                question: prompt_text,
                expected_answer: None,
            });
        } else if line.starts_with("expect_quesion_answer") {
            if let Some(prompt) = prompts_question.last_mut() {
                prompt.expected_answer = Some(line.split_once(':').map(|(_, p)| p.trim().to_string()).unwrap_or_default());
            }
        } else if line.starts_with("prompt_answer") {
            let prompt_text = line.split_once(':').map(|(_, p)| p.trim().to_string()).unwrap_or_default();
            prompts_answer.push(Prompt {
                question: prompt_text,
                expected_answer: None,
            });
        } else if line.starts_with("expect_answer_answer") {
            if let Some(prompt) = prompts_answer.last_mut() {
                prompt.expected_answer = Some(line.split_once(':').map(|(_, p)| p.trim().to_string()).unwrap_or_default());
            }
        }
    }

    Ok((Story { question, answer }, prompts_question, prompts_answer))
}


async fn call_openai_with_memory(
    client: &Client,
    api_key: &str,
    prompt_input: &str,
    story_data: Arc<Mutex<Vec<Story>>>,
) -> Result<String, Box<dyn std::error::Error>> {
    let story = {
        let data = story_data.lock().await;
        data.first().cloned().ok_or("스토리 데이터가 없습니다")?
    };

        let second_request_body = json!({
            "model": "gpt-4o-mini-2024-07-18",
            "messages": [
        {
            "role": "system",
            "content": format!(
                "당신은 바다거북수프 게임의 사회자입니다. 다음에 문제와 이야기가 주어집니다.\n\n문제: {}\n부분 이야기: {}\n\n당신의 임무는 다음과 같습니다:\n\n1. 질문 속 모든 단어들의 정의를 엄격히 재단하세요. 그런 다음 질문의 의미가 이야기와 완벽히 일치되는지 정확히 판단하세요. 모든 단어들의 의미가 완벽히 들어맞아야 합니다. 예를 들어, 사진은 그림을 뜻하지 않고 사진기를 통해서 찍은 사진만을 뜻합니다. \n2. 부분 이야기를 깊이 있게 분석하여 부분 이야기에는 나와있지 않은 숨겨진 진실과 배경을 알아내세요. 알아낸 것을 토대로 하나의 전체 이야기를 이해하세요.\n3. 위의 단계들를 바탕으로 질문에 대한 답을 '네.' 또는 '아니오.' 로만 제공하세요. 추가적인 설명이나 정보는 제공하지 마세요.",
                story.question,
                story.answer
            )
        },
        {
            "role": "user",
            "content": format!(
                "질문 : {}",
                prompt_input

            )
        }
    ],
            "max_tokens": 100,
            "temperature": 0.0
        });

        // 두 번째 요청 보내기
        let second_res = client
            .post("https://api.openai.com/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", api_key))
            .json(&second_request_body)
            .send()
            .await?;

        if second_res.status() != StatusCode::OK {
            return Err("Unexpected status code".into());
        }

        let second_request_body: ChatResponse = second_res.json().await?;
        let second_result = second_request_body
            .choices
            .get(0)
            .map(|choice| choice.message.content.clone())
            .ok_or("Empty response")?;

        let third_request_body = json!({
            "model": "gpt-4o-mini-2024-07-18",
            "messages": [
        {
            "role": "system",
            "content": format!(
                "당신은 바다거북수프 게임의 사회자입니다. 다음에 문제와 이야기가 주어집니다.\n\n문제: {}\n부분 이야기: {}\n\n당신의 임무는 다음과 같습니다:\n\n1. 질문 속 모든 단어들의 정의를 엄격히 재단하세요. 그런 다음 질문의 의미가 이야기와 완벽히 일치되는지 정확히 판단하세요. 모든 단어들의 의미가 완벽히 들어맞아야 합니다. 예를 들어, 사진은 그림을 뜻하지 않고 사진기를 통해서 찍은 사진만을 뜻합니다. \n2. 부분 이야기를 깊이 있게 분석하여 부분 이야기에는 나와있지 않은 숨겨진 진실과 배경을 알아내세요. 알아낸 것을 토대로 하나의 전체 이야기를 이해하세요.\n3. 위의 단계들를 바탕으로 질문에 대한 답을 '네.' 또는 '아니오.' 로 제공하세요. 추가적인 설명이나 정보는 제공하지 마세요.",
                story.question,
                story.answer
            )
        },
        {
            "role": "user",
            "content": format!(
                "{}",
                prompt_input

            )
        }
    ],
            "max_tokens": 100,
            "temperature": 0.0
        });

        // 두 번째 요청 보내기
        let third_res = client
            .post("https://api.openai.com/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", api_key))
            .json(&third_request_body)
            .send()
            .await?;

        if third_res.status() != StatusCode::OK {
            return Err("Unexpected status code".into());
        }

        let third_request_body: ChatResponse = third_res.json().await?;
        let final_result = third_request_body
            .choices
            .get(0)
            .map(|choice| choice.message.content.clone())
            .ok_or("Empty response")?;

        
    let request_body = json!({
        "model": "gpt-4o-mini-2024-07-18",
        "messages": [
        {"role": "system", "content": format!(
            "당신은 바다거북수프 게임의 사회자입니다. 다음에 문제와 이야기가 주어집니다.\n\n문제: {}\n부분 이야기: {}\n\n당신의 임무는 다음과 같습니다:\n\n1. 질문 속 모든 단어들의 정의를 엄격히 재단하세요. 그런 다음 질문의 의미가 이야기와 완벽히 일치되는지 정확히 판단하세요. 모든 단어들의 의미가 완벽히 들어맞아야 합니다. 예를 들어, 사진은 그림을 뜻하지 않고 사진기를 통해서 찍은 사진만을 뜻합니다. \n2. 부분 이야기를 깊이 있게 분석하여 부분 이야기에는 나와있지 않은 숨겨진 진실과 배경을 알아내세요. 알아낸 것을 토대로 하나의 전체 이야기를 이해하세요.\n3. 문제 해결에 상관있는 지 질문인지 판단하세요.\n4. 주어진 질문이 예 아니오로 명확하게 답을 제공할 수 있는 질문인지 판단하세요.\n5. 질문이 이야기의 핵심을 짚는 지 판단하세요.\n6. 위의 결과에 따라 질문의 중요도를 평가해주세요. 답을 '질문의 중요도 : ?/10' 으로만 제공하세요. 절대로 추가적인 설명이나 정보는 제공하지 마세요.",
            story.question,
            story.answer
        )},
        {"role": "user", "content": format!(
            "{}",
            prompt_input
        )}
    ],
        "max_tokens": 200,
        "temperature": 0.0
    });

let res = client
    .post("https://api.openai.com/v1/chat/completions")
    .header("Authorization", format!("Bearer {}", api_key))
    .json(&request_body)
    .send()
    .await?;

if res.status() != StatusCode::OK {
    return Err("Unexpected status code".into());
}

let response_body: ChatResponse = res.json().await?;
let initial_result = response_body
    .choices
    .get(0)
    .map(|choice| choice.message.content.clone())
    .ok_or("Empty response")?;

    let importance_regex = Regex::new(r"질문의 중요도\s*:\s*(\d+)/10").unwrap();
    let importance = importance_regex
        .captures(&initial_result)
        .and_then(|caps| caps.get(1).and_then(|m| m.as_str().parse::<i32>().ok()));        
    
    // 형식이 맞지 않으면 "잘못된 형식입니다"를 반환합니다.
    if importance.is_none() {
        if final_result.contains("네") || second_result.contains("네") { return Ok(format!("네"));}
        else {
            return Ok(format!("아니오"));
        }
    } else {
        let importance_value = match importance {
            Some(value) => value,
            None => return Err("잘못된 형식입니다".into()),
        };

            if final_result.contains("네") || second_result.contains("네") {
                
                    return Ok(format!("네. {}", importance_value));
            } else {
                
                    return Ok(format!("아니오. {}", importance_value));
            }
        }
                
    // "모르겠습니다" 또는 기타 응답에 대한 처리
    Ok("잘못된 응답입니다.".to_string())
}

async fn call_openai_with_memory_answer(
    client: &Client,
    api_key: &str,
    prompt_input: &str,
    story_data: Arc<Mutex<Vec<Story>>>,
) -> Result<String, Box<dyn std::error::Error>> {
    let story = {
        let data = story_data.lock().await;
        data.first().cloned().ok_or("스토리 데이터가 없습니다")?
    };

        // 두 번째 요청을 위한 프롬프트 생성
        let prompt = format!(
            "너는 바다거북수프의 게임의 사회자야. 다음은 바다거북수프 문제야.<바다거북수프>\n이야기: {}\n질문: {}\n",
            story.answer, story.question,
        );

        let second_request_body = json!({
            "model": "gpt-4o-mini-2024-07-18",
            "messages": [
                {"role": "system", "content": format!(
                    "너는 바다거북수프의 게임의 사회자야. 다음은 바다거북수프 문제야.<바다거북수프>\n질문: {}\n정답: {}\n 이야기를 이해하고 정답을 판별해. 맞습니다 아닙니다로 대답해.",
            story.answer, story.question,
                )},
                {"role": "user", "content": format!(
                    "{}",
                    prompt_input
                )}
            ],
            "max_tokens": 200,
            "temperature": 0.0
        });

        // 두 번째 요청 보내기
        let second_res = client
            .post("https://api.openai.com/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", api_key))
            .json(&second_request_body)
            .send()
            .await?;

        if second_res.status() != StatusCode::OK {
            return Err("Unexpected status code".into());
        }

        let second_response_body: ChatResponse = second_res.json().await?;
        let final_result = second_response_body
            .choices
            .get(0)
            .map(|choice| choice.message.content.clone())
            .ok_or("Empty response")?;

        return Ok(final_result);

    // "모르겠습니다" 또는 기타 응답에 대한 처리
    Ok("다시 정답을 말해주세요.".to_string())
}