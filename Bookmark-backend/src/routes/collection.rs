use axum::{
    routing::{get, post},
    Router,
};

use crate::handlers::collection::{
    create_collection, delete_collection, get_collection, list_collections, update_collection,
};
use crate::state::app_state::AppState;

pub fn collection_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_collection).get(list_collections))
        .route(
            "/:id",
            get(get_collection)
                .put(update_collection)
                .delete(delete_collection),
        )
}
