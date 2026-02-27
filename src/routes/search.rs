use axum::{
    routing::get,
    Router,
};

use crate::state::app_state::AppState;
use crate::handlers::search::search_bookmarks;

pub fn search_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(search_bookmarks))
}