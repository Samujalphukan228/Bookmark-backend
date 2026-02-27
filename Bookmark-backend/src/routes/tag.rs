use axum::{
    routing::get,
    Router,
};

use crate::state::app_state::AppState;
use crate::handlers::tag::{list_tags, bookmarks_by_tag};

pub fn tag_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(list_tags))
        .route("/bookmarks", get(bookmarks_by_tag))
}