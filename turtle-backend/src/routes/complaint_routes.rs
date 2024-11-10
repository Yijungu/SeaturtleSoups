use actix_web::web;
use crate::handlers::create_complaint;

pub fn complaint_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(create_complaint);
}
