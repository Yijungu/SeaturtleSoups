use actix_web::web;
use crate::handlers::{change_password, check_username_duplicate, insert_user, login, recover_password, find_username};

pub fn user_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(check_username_duplicate)
       .service(insert_user)
       .service(login)
       .service(recover_password)
       .service(find_username)
    .service(change_password);
}
