use actix_web::web;
use crate::handlers::{login_with_naver, verify_jwt};

pub fn auth_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(login_with_naver);
    cfg.service(verify_jwt);
}
