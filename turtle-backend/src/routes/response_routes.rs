use actix_web::web;
use crate::handlers::get_responses_by_date;

pub fn response_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_responses_by_date);
        
}
