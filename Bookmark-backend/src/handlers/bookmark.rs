use axum::{
    extract::{State, Path},
    http::StatusCode,
    Json,
    Extension,
};
use mongodb::bson::{doc, oid::ObjectId};
use chrono::Utc;
use validator::Validate;
use futures::TryStreamExt;

use crate::state::app_state::AppState;
use crate::models::bookmark::{
    Bookmark,
    CreateBookmarkRequest,
    UpdateBookmarkRequest,
    BookmarkResponse,
};
use crate::utils::jwt::Claims;


// Create bookmark
pub async fn create_bookmark(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Json(body): Json<CreateBookmarkRequest>,
) -> Result<(StatusCode, Json<BookmarkResponse>), (StatusCode, String)> {

    if let Err(errors) = body.validate() {
        return Err((StatusCode::BAD_REQUEST, errors.to_string()));
    }

    let user_id = ObjectId::parse_str(&claims.sub)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid user id".to_string()))?;

    let collection_id = match &body.collection_id {
        Some(id) => Some(ObjectId::parse_str(id)
            .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid collection id".to_string()))?),
        None => None,
    };

    let now = Utc::now();

    let bookmark = Bookmark {
        id: None,
        user_id,
        title: body.title,
        url: body.url,
        description: body.description,
        tags: body.tags,
        collection_id,
        created_at: now,
        updated_at: now,
    };

    let collection = state.db.collection::<Bookmark>("bookmarks");

    let result = collection
        .insert_one(&bookmark, None)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create bookmark".to_string()))?;

    let mut created = bookmark;
    created.id = Some(result.inserted_id.as_object_id().unwrap());

    Ok((StatusCode::CREATED, Json(BookmarkResponse::from(created))))
}


// List all bookmarks for user
pub async fn list_bookmarks(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
) -> Result<Json<Vec<BookmarkResponse>>, (StatusCode, String)> {

    let user_id = ObjectId::parse_str(&claims.sub)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid user id".to_string()))?;

    let collection = state.db.collection::<Bookmark>("bookmarks");

    let cursor = collection
        .find(doc! { "user_id": user_id }, None)
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


// Get single bookmark
pub async fn get_bookmark(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<String>,
) -> Result<Json<BookmarkResponse>, (StatusCode, String)> {

    let user_id = ObjectId::parse_str(&claims.sub)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid user id".to_string()))?;

    let bookmark_id = ObjectId::parse_str(&id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid bookmark id".to_string()))?;

    let collection = state.db.collection::<Bookmark>("bookmarks");

    let bookmark = collection
        .find_one(doc! { "_id": bookmark_id, "user_id": user_id }, None)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?
        .ok_or((StatusCode::NOT_FOUND, "Bookmark not found".to_string()))?;

    Ok(Json(BookmarkResponse::from(bookmark)))
}


// Update bookmark
pub async fn update_bookmark(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<String>,
    Json(body): Json<UpdateBookmarkRequest>,
) -> Result<Json<BookmarkResponse>, (StatusCode, String)> {

    let user_id = ObjectId::parse_str(&claims.sub)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid user id".to_string()))?;

    let bookmark_id = ObjectId::parse_str(&id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid bookmark id".to_string()))?;

    let collection = state.db.collection::<Bookmark>("bookmarks");

    // Build update document
    let mut update_doc = doc! {
        "updated_at": Utc::now().to_rfc3339()
    };

    if let Some(title) = &body.title {
        update_doc.insert("title", title);
    }
    if let Some(url) = &body.url {
        update_doc.insert("url", url);
    }
    if let Some(description) = &body.description {
        update_doc.insert("description", description);
    }
    if let Some(tags) = &body.tags {
        update_doc.insert("tags", tags);
    }
    if let Some(collection_id) = &body.collection_id {
        let col_id = ObjectId::parse_str(collection_id)
            .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid collection id".to_string()))?;
        update_doc.insert("collection_id", col_id);
    }

    collection
        .update_one(
            doc! { "_id": bookmark_id, "user_id": user_id },
            doc! { "$set": update_doc },
            None,
        )
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to update bookmark".to_string()))?;

    // Fetch updated bookmark
    let bookmark = collection
        .find_one(doc! { "_id": bookmark_id, "user_id": user_id }, None)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?
        .ok_or((StatusCode::NOT_FOUND, "Bookmark not found".to_string()))?;

    Ok(Json(BookmarkResponse::from(bookmark)))
}


// Delete bookmark
pub async fn delete_bookmark(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<String>,
) -> Result<StatusCode, (StatusCode, String)> {

    let user_id = ObjectId::parse_str(&claims.sub)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid user id".to_string()))?;

    let bookmark_id = ObjectId::parse_str(&id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid bookmark id".to_string()))?;

    let collection = state.db.collection::<Bookmark>("bookmarks");

    let result = collection
        .delete_one(doc! { "_id": bookmark_id, "user_id": user_id }, None)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to delete bookmark".to_string()))?;

    if result.deleted_count == 0 {
        return Err((StatusCode::NOT_FOUND, "Bookmark not found".to_string()));
    }

    Ok(StatusCode::NO_CONTENT)
}