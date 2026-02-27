use axum::{
    routing::{get, post, put, delete},
    Router,
};

use crate::state::app_state::AppState;
use crate::handlers::bookmark::{
    create_bookmark,
    list_bookmarks,
    get_bookmark,
    update_bookmark,
    delete_bookmark,
};

pub fn bookmark_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_bookmark).get(list_bookmarks))
        .route("/:id", get(get_bookmark).put(update_bookmark).delete(delete_bookmark))
}