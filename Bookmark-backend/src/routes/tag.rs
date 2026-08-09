use axum::{routing::get, Router};

use crate::handlers::tag::{bookmarks_by_tag, list_tags};
use crate::state::app_state::AppState;

pub fn tag_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(list_tags))
        .route("/bookmarks", get(bookmarks_by_tag))
}
