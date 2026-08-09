use axum::{routing::post, Router};

use crate::handlers::import::import_bookmarks;
use crate::state::app_state::AppState;

pub fn import_routes() -> Router<AppState> {
    Router::new().route("/", post(import_bookmarks))
}
