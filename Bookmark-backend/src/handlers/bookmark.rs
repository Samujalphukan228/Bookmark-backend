use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use chrono::Utc;
use futures::TryStreamExt;
use mongodb::bson::{doc, oid::ObjectId};
use mongodb::options::FindOptions;
use serde::Deserialize;
use validator::Validate;

use crate::errors::app_error::AppError;
use crate::middleware::auth::AuthenticatedUser;
use crate::models::bookmark::{
    Bookmark, BookmarkResponse, CreateBookmarkRequest, UpdateBookmarkRequest,
};
use crate::models::collection::Collection;
use crate::state::app_state::AppState;

#[derive(Debug, Deserialize)]
pub struct ListQuery {
    #[serde(default = "default_limit")]
    pub limit: i64,

    #[serde(default)]
    pub offset: i64,
}

fn default_limit() -> i64 {
    50
}

fn db_error(e: mongodb::error::Error) -> AppError {
    AppError::Internal(format!("Database error: {e}"))
}

async fn ensure_collection_owned(
    state: &AppState,
    user_id: ObjectId,
    collection_id: &ObjectId,
) -> Result<(), AppError> {
    let collections = state.db.collection::<Collection>("collections");

    let found = collections
        .find_one(doc! { "_id": collection_id, "user_id": user_id }, None)
        .await
        .map_err(db_error)?;

    if found.is_none() {
        return Err(AppError::BadRequest("Collection not found".to_string()));
    }

    Ok(())
}

pub async fn create_bookmark(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    Json(body): Json<CreateBookmarkRequest>,
) -> Result<(StatusCode, Json<BookmarkResponse>), AppError> {
    if let Err(errors) = body.validate() {
        return Err(AppError::BadRequest(errors.to_string()));
    }

    let user_id = user.0;

    let collection_id = match &body.collection_id {
        Some(id) => {
            let oid = ObjectId::parse_str(id)
                .map_err(|_| AppError::BadRequest("Invalid collection id".to_string()))?;
            ensure_collection_owned(&state, user_id, &oid).await?;
            Some(oid)
        }
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
        .map_err(db_error)?;

    let mut created = bookmark;
    created.id = result.inserted_id.as_object_id();

    Ok((StatusCode::CREATED, Json(BookmarkResponse::from(created))))
}

pub async fn list_bookmarks(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    Query(query): Query<ListQuery>,
) -> Result<Json<Vec<BookmarkResponse>>, AppError> {
    let user_id = user.0;
    let limit = query.limit.clamp(1, 100);
    let offset = query.offset.max(0) as u64;

    let collection = state.db.collection::<Bookmark>("bookmarks");

    let options = FindOptions::builder()
        .limit(Some(limit))
        .skip(Some(offset))
        .sort(Some(doc! { "created_at": -1 }))
        .build();

    let cursor = collection
        .find(doc! { "user_id": user_id }, options)
        .await
        .map_err(db_error)?;

    let bookmarks: Vec<Bookmark> = cursor.try_collect().await.map_err(db_error)?;

    let response: Vec<BookmarkResponse> =
        bookmarks.into_iter().map(BookmarkResponse::from).collect();

    Ok(Json(response))
}

pub async fn get_bookmark(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<String>,
) -> Result<Json<BookmarkResponse>, AppError> {
    let user_id = user.0;

    let bookmark_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid bookmark id".to_string()))?;

    let collection = state.db.collection::<Bookmark>("bookmarks");

    let bookmark = collection
        .find_one(doc! { "_id": bookmark_id, "user_id": user_id }, None)
        .await
        .map_err(db_error)?
        .ok_or_else(|| AppError::NotFound("Bookmark not found".to_string()))?;

    Ok(Json(BookmarkResponse::from(bookmark)))
}

pub async fn update_bookmark(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<String>,
    Json(body): Json<UpdateBookmarkRequest>,
) -> Result<Json<BookmarkResponse>, AppError> {
    if let Err(errors) = body.validate() {
        return Err(AppError::BadRequest(errors.to_string()));
    }

    let user_id = user.0;

    let bookmark_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid bookmark id".to_string()))?;

    if body.title.is_none()
        && body.url.is_none()
        && body.description.is_none()
        && body.tags.is_none()
        && body.collection_id.is_none()
    {
        return Err(AppError::BadRequest("No fields to update".to_string()));
    }

    let mut set = doc! { "updated_at": mongodb::bson::DateTime::now() };
    let mut unset = doc! {};

    if let Some(title) = &body.title {
        set.insert("title", title);
    }
    if let Some(url) = &body.url {
        set.insert("url", url);
    }
    if let Some(description) = &body.description {
        match description {
            Some(value) => {
                set.insert("description", value);
            }
            None => {
                unset.insert("description", "");
            }
        }
    }
    if let Some(tags) = &body.tags {
        set.insert("tags", tags);
    }
    if let Some(collection_id) = &body.collection_id {
        match collection_id {
            Some(value) => {
                let oid = ObjectId::parse_str(value)
                    .map_err(|_| AppError::BadRequest("Invalid collection id".to_string()))?;
                ensure_collection_owned(&state, user_id, &oid).await?;
                set.insert("collection_id", oid);
            }
            None => {
                unset.insert("collection_id", "");
            }
        }
    }

    let mut update = doc! { "$set": set };
    if !unset.is_empty() {
        update.insert("$unset", unset);
    }

    let collection = state.db.collection::<Bookmark>("bookmarks");

    let result = collection
        .update_one(
            doc! { "_id": bookmark_id, "user_id": user_id },
            update,
            None,
        )
        .await
        .map_err(db_error)?;

    if result.matched_count == 0 {
        return Err(AppError::NotFound("Bookmark not found".to_string()));
    }

    let bookmark = collection
        .find_one(doc! { "_id": bookmark_id, "user_id": user_id }, None)
        .await
        .map_err(db_error)?
        .ok_or_else(|| AppError::NotFound("Bookmark not found".to_string()))?;

    Ok(Json(BookmarkResponse::from(bookmark)))
}

pub async fn delete_bookmark(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<String>,
) -> Result<StatusCode, AppError> {
    let user_id = user.0;

    let bookmark_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid bookmark id".to_string()))?;

    let collection = state.db.collection::<Bookmark>("bookmarks");

    let result = collection
        .delete_one(doc! { "_id": bookmark_id, "user_id": user_id }, None)
        .await
        .map_err(db_error)?;

    if result.deleted_count == 0 {
        return Err(AppError::NotFound("Bookmark not found".to_string()));
    }

    Ok(StatusCode::NO_CONTENT)
}
