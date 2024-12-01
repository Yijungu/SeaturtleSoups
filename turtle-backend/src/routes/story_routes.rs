use crate::handlers::story_handler::{
    delete_story,
    get_all_stories, // 새로 추가된 핸들러
    get_story_by_id,
    insert_story_to_db,
    get_all_reviewed_stories,
    validate_story_creater,
    update_is_reviewed
};
use actix_web::web;

pub fn story_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(insert_story_to_db)
        .service(delete_story)
        .service(get_all_stories)
        .service(get_all_reviewed_stories)
        .service(validate_story_creater)
        .service(update_is_reviewed)
        .service(get_story_by_id);
}
