use axum::{
    routing::{get, post, put, delete},
    Router,
};

use crate::state::app_state::AppState;
use crate::handlers::collection::{
    create_collection,
    list_collections,
    get_collection,
    update_collection,
    delete_collection,
};

pub fn collection_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_collection).get(list_collections))
        .route("/:id", get(get_collection).put(update_collection).delete(delete_collection))
}