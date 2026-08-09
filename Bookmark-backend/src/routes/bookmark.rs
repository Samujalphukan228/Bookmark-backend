use axum::{
    routing::{get, post},
    Router,
};

use crate::handlers::bookmark::{
    create_bookmark, delete_bookmark, get_bookmark, list_bookmarks, update_bookmark,
};
use crate::state::app_state::AppState;

pub fn bookmark_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_bookmark).get(list_bookmarks))
        .route(
            "/:id",
            get(get_bookmark)
                .put(update_bookmark)
                .delete(delete_bookmark),
        )
}
