use crate::handlers::story_handler::{
    delete_story,
    get_all_stories, // 새로 추가된 핸들러
    get_stories_by_month,
    get_story_answer_from_memory,
    get_story_by_id,
    get_story_by_today,
    get_story_hints,
    get_story_question_from_memory,
    insert_story_to_db,
    refresh_story,
};
use actix_web::web;

pub fn story_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(insert_story_to_db)
        .service(delete_story)
        .service(get_all_stories)
        .service(get_stories_by_month)
        .service(get_story_question_from_memory)
        .service(get_story_answer_from_memory)
        .service(get_story_hints)
        .service(refresh_story)
        .service(get_story_by_id)
        .service(get_story_by_today);
}
