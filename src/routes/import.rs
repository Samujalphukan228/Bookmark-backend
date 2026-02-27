use axum::{
    routing::post,
    Router,
};

use crate::state::app_state::AppState;
use crate::handlers::import::import_bookmarks;

pub fn import_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(import_bookmarks))
}