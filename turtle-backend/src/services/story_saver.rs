use crate::models::Story;
use crate::models::{Rating, SharedRating};
use chrono::{
    Days, Duration as ChronoDuration, Local, NaiveDate, NaiveDateTime, NaiveTime, TimeZone,
};
use sqlx::PgPool;
use std::io::{self, Write}; // flush 사용
use std::sync::Arc;
use std::time::Duration;
use tokio::{sync::Mutex, time::sleep};
use crate::services::openai_service::fetch_background_from_openai;

pub async fn schedule_story_reset(
    story_data: Arc<Mutex<Vec<Story>>>,
    rating_data: SharedRating,
    db_pool: PgPool,
) {
    loop {
        let now = Local::now();

        let reset_time = NaiveTime::from_hms_opt(00, 01, 0).unwrap();
        let today_reset_naive = NaiveDateTime::new(now.date_naive(), reset_time);

        let next_reset = if now.time() < reset_time {
            Local
                .from_local_datetime(&today_reset_naive)
                .single()
                .unwrap()
        } else {
            let tomorrow = now.date_naive().succ_opt().unwrap();
            let tomorrow_reset_naive = NaiveDateTime::new(tomorrow, reset_time);
            Local
                .from_local_datetime(&tomorrow_reset_naive)
                .single()
                .unwrap()
        };

        let duration_until_reset = (next_reset - now)
            .to_std()
            .unwrap_or(Duration::from_secs(0));
        println!(
            "Waiting {:?} until next reset at 00:01...",
            duration_until_reset
        );
        io::stdout().flush().unwrap(); // 로그를 즉시 출력

        sleep(duration_until_reset).await;

        if let Err(err) = update_story_data(&story_data, &rating_data, &db_pool).await {
            eprintln!("Failed to update story data: {}", err);
            io::stdout().flush().unwrap(); // 에러 로그도 플러시
        }
    }
}

async fn update_story_data(
    story_data: &Arc<Mutex<Vec<Story>>>,
    rating_data: &SharedRating,
    db_pool: &PgPool,
) -> Result<(), sqlx::Error> {
    println!("Fetching new story data from the database...");
    io::stdout().flush().unwrap(); // 플러시

    let mut new_stories = fetch_stories_from_db(db_pool).await?;

    for story in &mut new_stories {
        if story.background.is_none() {
            story.background = Some(
                fetch_background_from_openai(&story.question, &story.answer)
                    .await
                    .map_err(|e| sqlx::Error::Decode(Box::new(e)))?  // Convert OpenAIError to sqlx::Error
            );
        }
    }

    let mut data = story_data.lock().await; // 비동기적 잠금
    data.clear();
    data.extend(new_stories);

    save_rating_to_db(rating_data, db_pool).await?;

    println!("Successfully updated story data.");
    io::stdout().flush().unwrap(); // 플러시
    Ok(())
}

pub async fn fetch_stories_from_db(db_pool: &PgPool) -> Result<Vec<Story>, sqlx::Error> {
    let today = Local::now().date_naive();

    println!("Querying stories for date: {}", today);
    io::stdout().flush().unwrap(); // 플러시

    let stories = sqlx::query_as::<_, Story>(
        r#"
        SELECT id, question, answer, background, date, success_count, rating, hint1, hint2
        FROM stories
        WHERE date = $1::date
        "#,
    )
    .bind(today)
    .fetch_all(db_pool)
    .await?;

    println!("Fetched {} stories from the database.", stories.len());
    io::stdout().flush().unwrap(); // 플러시

    Ok(stories)
}

pub async fn save_rating_to_db(
    rating_data: &SharedRating,
    db_pool: &PgPool,
) -> Result<(), sqlx::Error> {
    let rating = rating_data.lock().await.clone(); // 현재 평점 복사

    println!(
        "Saving rating to DB: count={}, average={:.2}",
        rating.count, rating.average
    );
    io::stdout().flush().unwrap();

    // **전날**의 날짜 가져오기
    let yesterday = Local::now()
        .date_naive()
        .checked_sub_days(Days::new(1))
        .unwrap_or_else(|| NaiveDate::from_ymd_opt(1970, 1, 1).unwrap()); // 오류 방지를 위한 기본값

    println!("Updating ratings for stories on: {}", yesterday);
    io::stdout().flush().unwrap();

    // 전날의 스토리들에 대한 평점 업데이트
    sqlx::query!(
        r#"
        UPDATE stories 
        SET rating = $1, success_count = $2
        WHERE date = $3::date
        "#,
        rating.average as f64,
        rating.count as i32, // 성공 횟수로 저장 (i32로 변환)
        yesterday
    )
    .execute(db_pool)
    .await?;

    // 평점 초기화
    let mut rating_data = rating_data.lock().await;
    *rating_data = Rating {
        count: 0,
        average: 0.0,
    };

    println!("Rating reset after saving.");
    io::stdout().flush().unwrap();

    Ok(())
}

pub async fn update_story_data_from_db(
    story_data: &Arc<Mutex<Vec<Story>>>,
    db_pool: &PgPool,
) -> Result<(), sqlx::Error> {
    println!("Fetching new story data from the database...");
    io::stdout().flush().unwrap(); // 플러시

    // 데이터베이스에서 스토리 가져오기
    let new_stories = fetch_stories_from_db(db_pool).await?;

    // story_data에 비동기적 잠금 후 데이터 갱신
    let mut data = story_data.lock().await;
    data.clear(); // 기존 데이터 삭제
    data.extend(new_stories); // 새로운 데이터 추가

    println!("Story data successfully updated.");
    io::stdout().flush().unwrap(); // 플러시

    Ok(())
}