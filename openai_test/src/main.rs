use dotenv::dotenv;
use regex::Regex;
use reqwest::{Client, StatusCode};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::env;
use std::fs::File;
use std::io::{self, BufRead};
use std::path::Path;
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Clone, Debug)]
struct Story {
    question: String,
    answer: String,
    backgroud: String,
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
    let (story, prompts_question, prompts_answer) = load_story_and_prompts(STORY_FILE)?;
    let story_data = Arc::new(Mutex::new(vec![story]));

    let client = Client::new();
    let mut n = 0;

    println!("=======================질문 테스트==========================");
    for (i, prompt) in prompts_question.iter().enumerate() {
        match call_openai_with_memory(&client, &api_key, &prompt.question, story_data.clone()).await
        {
            Ok(response) => {
                if let Some(expected) = &prompt.expected_answer {
                    if &response == expected {
                        println!(
                            "✅ 테스트 성공 - 프롬프트 {}: 예상한 답변 '{}'과 일치합니다.",
                            &prompt.question, expected
                        );
                        n += 1;
                    } else {
                        println!("❌ 테스트 실패 - 프롬프트 {}: 예상 답변 '{}'과 실제 답변 '{}'이 일치하지 않습니다.",  &prompt.question, expected, response);
                    }
                } else {
                    println!(
                        "❓ 예상 답변이 지정되지 않은 프롬프트 {}: 응답 확인 필요",
                        i + 1
                    );
                }
            }
            Err(e) => eprintln!(
                "⚠️ 'call_openai_with_memory' 함수 오류 (프롬프트 {}): {}",
                i + 1,
                e
            ),
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
    let mut backgroud = String::new();
    let mut prompts_question = Vec::new();
    let mut prompts_answer = Vec::new();

    for line in reader.lines() {
        let line = line?;
        if line.starts_with("question:") {
            question = line["question:".len()..].trim().to_string();
        } else if line.starts_with("answer:") {
            answer = line["answer:".len()..].trim().to_string();
        } else if line.starts_with("backgroud:") {
            backgroud = line["backgroud:".len()..].trim().to_string();
        } else if line.starts_with("prompt_question") {
            let prompt_text = line
                .split_once(':')
                .map(|(_, p)| p.trim().to_string())
                .unwrap_or_default();
            prompts_question.push(Prompt {
                question: prompt_text,
                expected_answer: None,
            });
        } else if line.starts_with("expect_quesion_answer") {
            if let Some(prompt) = prompts_question.last_mut() {
                prompt.expected_answer = Some(
                    line.split_once(':')
                        .map(|(_, p)| p.trim().to_string())
                        .unwrap_or_default(),
                );
            }
        } else if line.starts_with("prompt_answer") {
            let prompt_text = line
                .split_once(':')
                .map(|(_, p)| p.trim().to_string())
                .unwrap_or_default();
            prompts_answer.push(Prompt {
                question: prompt_text,
                expected_answer: None,
            });
        } else if line.starts_with("expect_answer_answer") {
            if let Some(prompt) = prompts_answer.last_mut() {
                prompt.expected_answer = Some(
                    line.split_once(':')
                        .map(|(_, p)| p.trim().to_string())
                        .unwrap_or_default(),
                );
            }
        }
    }

    Ok((Story { question, answer, backgroud }, prompts_question, prompts_answer))
}

async fn call_openai_with_memory(
    client: &Client,
    api_key: &str,
    prompt_input: &str,
    story_data: Arc<Mutex<Vec<Story>>>,
) -> Result<String, Box<dyn std::error::Error>> {
    // Story 데이터 가져오기
    let story = {
        let data = story_data.lock().await;
        data.first().cloned().ok_or("스토리 데이터가 없습니다")?
    };

    // OpenAI API 호출 함수
    async fn send_request(
        client: &Client,
        api_key: &str,
        model: &str,
        system_content: &str,
        backgroud_content: &str,
        user_content: &str,
    ) -> Result<String, Box<dyn std::error::Error>> {
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
            return Err("Unexpected status code".into());
        }

        let response_body: ChatResponse = response.json().await?;
        let result = response_body
            .choices
            .get(0)
            .map(|choice| choice.message.content.clone())
            .ok_or("Empty response")?;

        Ok(result)
    }

    async fn send_request_importance(
        client: &Client,
        api_key: &str,
        model: &str,
        system_content: &str,
        user_content: &str,
    ) -> Result<String, Box<dyn std::error::Error>> {
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
            return Err("Unexpected status code".into());
        }

        let response_body: ChatResponse = response.json().await?;
        let result = response_body
            .choices
            .get(0)
            .map(|choice| choice.message.content.clone())
            .ok_or("Empty response")?;

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
        story.question, story.answer
    );

    let second_result = send_request(&client, &api_key, model, &system_message, &story.backgroud, &format!("질문 : {}", prompt_input)).await?;
    let final_response = format!("{}", second_result);
    return Ok(final_response);

    let importance_message = format!(
        "당신은 바다거북수프 게임의 사회자입니다. 다음에 문제와 이야기가 주어집니다.\n\n문제: {}\n부분 이야기: {}\n\n당신의 임무는 다음과 같습니다:\n\n1. 질문 속 모든 단어들의 정의를 엄격히 재단하세요. 그런 다음 질문의 의미가 이야기와 완벽히 일치되는지 정확히 판단하세요. 모든 단어들의 의미가 완벽히 들어맞아야 합니다. 예를 들어, 사진은 그림을 뜻하지 않고 사진기를 통해서 찍은 사진만을 뜻합니다. \n2. 부분 이야기를 깊이 있게 분석하여 부분 이야기에는 나와있지 않은 숨겨진 진실과 배경을 알아내세요. 알아낸 것을 토대로 하나의 전체 이야기를 완성하세요.\n3. 주어진 질문이 네 아니오로 명확하게 답을 제공할 수 있는 질문인지 판단하세요.\n4. 주어진 질문이 이야기의 핵심을 짚는 지 판단하세요.\n5. 위의 단계들을 따라 질문의 중요도를 정확하게 평가해주세요. 답을 '질문의 중요도 : ?점' 으로만 제공하세요. 절대로 추가적인 설명이나 정보는 제공하지 마세요.",
        story.question, story.answer
    );
    

    let initial_result =
        send_request_importance(&client, &api_key, model, &importance_message, &prompt_input).await?;

    let final_response = format!("{}   [{}]", second_result, initial_result);
    Ok(final_response)
}

const STORY_FILE: &str = "story_data2.txt";

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

    let second_request_body = json!({
        "model": "gpt-4o-mini-2024-07-18",
        "messages": [
            {"role": "system", "content": format!(
                "당신은 바다거북수프 게임의 사회자입니다.\n\n문제: {}\n\n부분 이야기: {}\n\n당신의 임무는 다음과 같습니다:\n\n1. 부분 이야기를 깊이 있게 분석하여 부분 이야기에는 나와있지 않은 숨겨진 배경과 문제에 대한 답을 알아내세요.\n2 주어진 정답 속 모든 단어들의 정의를 엄격히 재단하세요. 그런 다음 정답의 의미가 이야기와 완벽히 일치되는지 정확히 판단하세요.\n3. 1번에서 알아낸 답이 들어가있는 지 입력으로 들어온 정답에 들어있는 지 판단하세요. 위의 단계들을 통해 주어진 정답을 맞는 지를 판단하세요. 답은 '맞습니다.' 또는 '틀립니다.'로 제공하세요. 추가적인 설명이나 정보는 제공하지 마세요.",
                story.question,
                story.answer,
            )},
            {"role": "user", "content": format!(
                "이야기의 핵심을 알아내세요."
            )},
            {"role": "user", "content": format!(
                "정확히 이야기의 핵심이 들어가 있는 지 판단해주세요. {}",
                prompt_input,
            )}
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

    let second_response_body: ChatResponse = second_res.json().await?;
    let final_result = second_response_body
        .choices
        .get(0)
        .map(|choice| choice.message.content.clone())
        .ok_or("Empty response")?;

        let second_request_body = json!({
            "model": "gpt-4o-mini-2024-07-18",
            "messages": [
                {"role": "system", "content": format!(
                    "당신은 바다거북수프 게임의 사회자입니다.\n\n문제: {}\n\n부분 이야기: {}\n\n당신의 임무는 다음과 같습니다:\n\n1. 부분 이야기를 깊이 있게 분석하여 부분 이야기에는 나와있지 않은 숨겨진 배경과 문제에 대한 답을 알아내세요.\n2 주어진 정답 속 모든 단어들의 정의를 엄격히 재단하세요. 그런 다음 정답의 의미가 이야기와 완벽히 일치되는지 정확히 판단하세요.\n3. 1번에서 알아낸 답이 들어가있는 지 입력으로 들어온 정답에 들어있는 지 판단하세요. 위의 단계들을 통해 주어진 정답을 맞는 지를 판단하세요. 답은 '맞습니다.' 또는 '틀립니다.'로 제공하세요. 추가적인 설명이나 정보는 제공하지 마세요.",
                    story.question,
                    story.answer,
                )},
                {"role": "user", "content": format!(
                    "이야기의 핵심을 알아내세요."
                )},
                {"role": "user", "content": format!(
                    "알아낸 이야기의 핵심을 토대로 사실 여부를 판단해주세요. {}",
                    prompt_input,
                )}
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
    
        let second_response_body: ChatResponse = second_res.json().await?;
        let final_result2 = second_response_body
            .choices
            .get(0)
            .map(|choice| choice.message.content.clone())
            .ok_or("Empty response")?;

            if final_result2.contains("맞습니다") && final_result.contains("맞습니다") {
                return Ok(format!("맞습니다."));
            } else {
                return Ok(format!("틀립니다."));
            }

    return Ok(final_result);

    // "모르겠습니다" 또는 기타 응답에 대한 처리
    Ok("다시 정답을 말해주세요.".to_string())
}