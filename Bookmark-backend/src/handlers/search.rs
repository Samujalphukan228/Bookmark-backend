use axum::{
    extract::{State, Query},
    http::StatusCode,
    Json,
    Extension,
};
use mongodb::bson::{doc, oid::ObjectId};
use futures::TryStreamExt;
use serde::Deserialize;

use crate::state::app_state::AppState;
use crate::models::bookmark::{Bookmark, BookmarkResponse};
use crate::utils::jwt::Claims;


#[derive(Debug, Deserialize)]
pub struct SearchQuery {
    pub q: String,
}


pub async fn search_bookmarks(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Query(query): Query<SearchQuery>,
) -> Result<Json<Vec<BookmarkResponse>>, (StatusCode, String)> {

    if query.q.trim().is_empty() {
        return Err((StatusCode::BAD_REQUEST, "Search query required".to_string()));
    }

    let user_id = ObjectId::parse_str(&claims.sub)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid user id".to_string()))?;

    let collection = state.db.collection::<Bookmark>("bookmarks");

    let filter = doc! {
        "$and": [
            { "user_id": user_id },
            { "$text": { "$search": &query.q } }
        ]
    };

    let cursor = collection
        .find(filter, None)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    let bookmarks: Vec<Bookmark> = cursor
        .try_collect()
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch results".to_string()))?;

    let response: Vec<BookmarkResponse> = bookmarks
        .into_iter()
        .map(BookmarkResponse::from)
        .collect();

    Ok(Json(response))
}