use actix_web::web;
use crate::handlers::{openai_handler::openai_handler, openai_handler_answer};

pub fn openai_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(openai_handler);
    cfg.service(openai_handler_answer);
}
