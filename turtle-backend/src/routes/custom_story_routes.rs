use crate::handlers::{
    create_custom_story,
    update_is_reviewed, // 새로 추가된 핸들러
    delete_custom_story,
};
use actix_web::web;

pub fn custom_story_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(create_custom_story)
        .service(update_is_reviewed)
        .service(delete_custom_story);
}
