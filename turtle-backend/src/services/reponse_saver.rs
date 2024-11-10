use tokio::sync::Mutex; // 비동기 Mutex 사용
use std::sync::Arc;
use sqlx::PgPool;
use crate::models::Response;
use tokio::time::{sleep, Duration};

type ResponseQueue = Arc<Mutex<Vec<Response>>>;

pub async fn batch_save_to_db(pool: PgPool, response_queue: ResponseQueue) {
    loop {
        // 30분마다 배치 작업 실행
        sleep(Duration::from_secs(30 * 60)).await; // 30분 = 30 * 60초

        // 비동기 락을 걸고 큐 접근
        let mut queue = response_queue.lock().await;

        // 큐에 데이터가 있을 때만 DB에 저장
        if !queue.is_empty() {
            let mut tx = pool.begin().await.unwrap();
            
            for response in queue.drain(..) {
                sqlx::query!(
                    "INSERT INTO responses (question, response) VALUES ($1, $2)",
                    response.question,
                    response.response
                )
                .execute(&mut tx)
                .await
                .unwrap();
            }

            tx.commit().await.unwrap();
            println!("Batch saved to DB");
        }
    }
}
