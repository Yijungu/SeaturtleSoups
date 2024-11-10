use sqlx::{PgPool, Pool, Postgres};
use std::error::Error;

pub async fn init_db(database_url: &str) -> Result<PgPool, Box<dyn Error>> {
    let pool = PgPool::connect(database_url).await?;
    Ok(pool)
}
