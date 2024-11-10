use serde::Deserialize;
use std::env;

#[derive(Deserialize)]
pub struct Config {
    pub server_url: String,
    pub database_url: String,
}

pub fn get_config() -> Config {
    dotenv::dotenv().ok(); // .env 파일 로드
    Config {
        server_url: env::var("SERVER_URL").expect("SERVER_URL must be set"),
        database_url: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
    }
}
