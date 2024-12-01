use actix_web::web;

mod story_routes;
mod response_routes;
mod openai_routes;
mod rating_routes;
mod auth_routes;
mod health_routes;
mod complaint_routes;
mod pending_story_routes;

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    story_routes::story_routes(cfg);
    response_routes::response_routes(cfg);
    openai_routes::openai_routes(cfg);
    rating_routes::rating_routes(cfg);
    auth_routes::auth_routes(cfg);
    health_routes::health_routes(cfg);
    complaint_routes::complaint_routes(cfg);
    pending_story_routes::pending_story_routes(cfg);
}

