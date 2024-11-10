use crate::handlers::story_handler::{
    delete_story,
    get_all_stories, // 새로 추가된 핸들러
    get_story_answer_from_memory,
    get_story_hints,
    get_story_question_from_memory,
    insert_story_to_db,
    refresh_story,
};
use actix_web::web;

pub fn story_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(insert_story_to_db)
        .service(delete_story)
        .service(get_all_stories) // 주 단위 스토리 조회 추가
        .service(get_story_question_from_memory)
        .service(get_story_answer_from_memory)
        .service(get_story_hints)
        .service(refresh_story);
}
