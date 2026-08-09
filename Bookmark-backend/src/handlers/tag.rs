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
pub struct TagQuery {
    pub tag: String,
}

fn db_error(e: mongodb::error::Error) -> AppError {
    AppError::Internal(format!("Database error: {e}"))
}

pub async fn list_tags(
    State(state): State<AppState>,
    user: AuthenticatedUser,
) -> Result<Json<Vec<serde_json::Value>>, AppError> {
    let user_id = user.0;

    let collection = state.db.collection::<Bookmark>("bookmarks");

    let pipeline = vec![
        doc! { "$match": { "user_id": user_id } },
        doc! { "$unwind": "$tags" },
        doc! { "$group": {
            "_id": "$tags",
            "count": { "$sum": 1 }
        }},
        doc! { "$sort": { "count": -1 } },
    ];

    let cursor = collection
        .aggregate(pipeline, None)
        .await
        .map_err(db_error)?;

    let results: Vec<mongodb::bson::Document> = cursor.try_collect().await.map_err(db_error)?;

    let tags: Vec<serde_json::Value> = results
        .into_iter()
        .map(|doc| {
            serde_json::json!({
                "name": doc.get_str("_id").unwrap_or_default(),
                "count": doc.get_i32("count").unwrap_or(0)
            })
        })
        .collect();

    Ok(Json(tags))
}

pub async fn bookmarks_by_tag(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    Query(query): Query<TagQuery>,
) -> Result<Json<Vec<BookmarkResponse>>, AppError> {
    let user_id = user.0;

    let collection = state.db.collection::<Bookmark>("bookmarks");

    let cursor = collection
        .find(doc! { "user_id": user_id, "tags": &query.tag }, None)
        .await
        .map_err(db_error)?;

    let bookmarks: Vec<Bookmark> = cursor.try_collect().await.map_err(db_error)?;

    let response: Vec<BookmarkResponse> =
        bookmarks.into_iter().map(BookmarkResponse::from).collect();

    Ok(Json(response))
}
