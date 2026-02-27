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
pub struct TagQuery {
    pub tag: String,
}


// List all unique tags with counts
pub async fn list_tags(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
) -> Result<Json<Vec<serde_json::Value>>, (StatusCode, String)> {

    let user_id = ObjectId::parse_str(&claims.sub)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid user id".to_string()))?;

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
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    let results: Vec<mongodb::bson::Document> = cursor
        .try_collect()
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch tags".to_string()))?;

    let tags: Vec<serde_json::Value> = results
        .into_iter()
        .map(|doc| {
            serde_json::json!({
                "name": doc.get_str("_id").unwrap_or(""),
                "count": doc.get_i32("count").unwrap_or(0)
            })
        })
        .collect();

    Ok(Json(tags))
}


// Get bookmarks by tag
pub async fn bookmarks_by_tag(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Query(query): Query<TagQuery>,
) -> Result<Json<Vec<BookmarkResponse>>, (StatusCode, String)> {

    let user_id = ObjectId::parse_str(&claims.sub)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid user id".to_string()))?;

    let collection = state.db.collection::<Bookmark>("bookmarks");

    let cursor = collection
        .find(doc! { "user_id": user_id, "tags": &query.tag }, None)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    let bookmarks: Vec<Bookmark> = cursor
        .try_collect()
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch bookmarks".to_string()))?;

    let response: Vec<BookmarkResponse> = bookmarks
        .into_iter()
        .map(BookmarkResponse::from)
        .collect();

    Ok(Json(response))
}