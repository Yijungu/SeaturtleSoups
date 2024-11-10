use actix_web::web;
use crate::handlers::add_rating;

pub fn rating_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(add_rating);
}
