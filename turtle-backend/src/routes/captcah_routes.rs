use actix_web::web;
use crate::handlers::{generate_captcha, validate_captcha};

pub fn captcah_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(generate_captcha)
       .service(validate_captcha);
}
