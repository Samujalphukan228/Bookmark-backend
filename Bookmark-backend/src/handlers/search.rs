use axum::{
    extract::{Query, State},
    Json,
};
use futures::TryStreamExt;
use mongodb::bson::doc;
use serde::Deserialize;

use crate::errors::app_error::AppError;
use crate::middleware::auth::AuthenticatedUser;
use crate::models::bookmark::{Bookmark, BookmarkResponse};
use crate::state::app_state::AppState;

#[derive(Debug, Deserialize)]
pub struct SearchQuery {
    pub q: String,
}

fn db_error(e: mongodb::error::Error) -> AppError {
    AppError::Internal(format!("Database error: {e}"))
}

pub async fn search_bookmarks(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    Query(query): Query<SearchQuery>,
) -> Result<Json<Vec<BookmarkResponse>>, AppError> {
    if query.q.trim().is_empty() {
        return Err(AppError::BadRequest("Search query required".to_string()));
    }

    let user_id = user.0;

    let collection = state.db.collection::<Bookmark>("bookmarks");

    let filter = doc! {
        "$and": [
            { "user_id": user_id },
            { "$text": { "$search": &query.q } }
        ]
    };

    let cursor = collection.find(filter, None).await.map_err(db_error)?;

    let bookmarks: Vec<Bookmark> = cursor.try_collect().await.map_err(db_error)?;

    let response: Vec<BookmarkResponse> =
        bookmarks.into_iter().map(BookmarkResponse::from).collect();

    Ok(Json(response))
}
