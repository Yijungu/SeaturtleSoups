use actix_cors::Cors;
use actix_web::{web, App, HttpServer};
use dotenv::dotenv;
use dotenv::from_filename;
use sqlx::migrate::Migrator;
use sqlx::postgres::{PgPool, PgPoolOptions};
use std::path::Path;
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::task;
use turtle_backend::models::{Response, Story};
use turtle_backend::routes::init_routes;
use turtle_backend::services::reponse_saver::batch_save_to_db;


pub type StoryData = Arc<Mutex<Vec<Story>>>;
pub type ResponseQueue = Arc<Mutex<Vec<Response>>>;

fn load_env() {
    let env = std::env::var("RUST_ENV").unwrap_or_else(|_| "local".to_string());
    match env.as_str() {
        "production" => {
            println!("Using .env.production");
            from_filename(".env.production").ok();
        }
        _ => {
            println!("Using .env.local");
            from_filename(".env.local").ok();
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    load_env();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let max_connections: u32 = std::env::var("MAX_DB_CONNECTIONS")
        .unwrap_or_else(|_| "5".to_string())
        .parse()
        .expect("MAX_DB_CONNECTIONS must be a valid integer");

    let db_pool: PgPool = PgPoolOptions::new()
        .max_connections(max_connections)
        .connect(&database_url)
        .await
        .expect("Failed to connect to the database");

    let migrator = Migrator::new(Path::new("./migrations"))
        .await
        .expect("Failed to create Migrator");
    migrator.run(&db_pool).await.expect("Failed to run migrations");

    let db_pool_clone = db_pool.clone();
    let response_queue: ResponseQueue = Arc::new(Mutex::new(Vec::new()));
    let queue_clone = Arc::clone(&response_queue);
    let pool_clone = db_pool.clone();
    task::spawn(async move {
        batch_save_to_db(pool_clone, queue_clone).await;
    });

    let db_pool_data = web::Data::new(db_pool); // 수정된 부분

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .app_data(db_pool_data.clone()) // 수정된 부분
            .app_data(web::Data::new(response_queue.clone()))
            .configure(init_routes)
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}
