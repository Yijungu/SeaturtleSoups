use crate::handlers::pending_story_handler::{
    insert_pending_story,
    get_all_pending_stories,
    delete_pending_story,
    apply_pending_story,
};
use actix_web::web;

pub fn pending_story_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(insert_pending_story)
        .service(get_all_pending_stories)
        .service(delete_pending_story)
        .service(apply_pending_story);
}
