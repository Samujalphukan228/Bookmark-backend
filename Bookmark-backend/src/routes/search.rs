use axum::{routing::get, Router};

use crate::handlers::search::search_bookmarks;
use crate::state::app_state::AppState;

pub fn search_routes() -> Router<AppState> {
    Router::new().route("/", get(search_bookmarks))
}
