use actix_web::web;
use crate::handlers::health_check;

pub fn health_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(health_check);
}
