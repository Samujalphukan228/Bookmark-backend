use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use chrono::Utc;
use futures::TryStreamExt;
use mongodb::bson::{doc, oid::ObjectId, Bson, Document};
use validator::Validate;

use crate::errors::app_error::AppError;
use crate::middleware::auth::AuthenticatedUser;
use crate::models::bookmark::{Bookmark, BookmarkResponse};
use crate::models::collection::{
    Collection, CollectionResponse, CreateCollectionRequest, UpdateCollectionRequest,
};
use crate::state::app_state::AppState;

fn db_error(e: mongodb::error::Error) -> AppError {
    AppError::Internal(format!("Database error: {e}"))
}

fn as_u64(value: &Bson) -> u64 {
    match value {
        Bson::Int32(v) => *v as u64,
        Bson::Int64(v) => *v as u64,
        Bson::Double(v) => *v as u64,
        _ => 0,
    }
}

fn collection_response_from_doc(doc: Document) -> Result<CollectionResponse, AppError> {
    let col: Collection = mongodb::bson::from_document(doc.clone())
        .map_err(|e| AppError::Internal(format!("Failed to deserialize collection: {e}")))?;

    Ok(CollectionResponse {
        id: col.id.map(|id| id.to_hex()).unwrap_or_default(),
        name: col.name,
        description: col.description,
        bookmark_count: as_u64(doc.get("bookmark_count").unwrap_or(&Bson::Int32(0))),
        created_at: col.created_at,
        updated_at: col.updated_at,
    })
}

pub async fn create_collection(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    Json(body): Json<CreateCollectionRequest>,
) -> Result<(StatusCode, Json<CollectionResponse>), AppError> {
    if let Err(errors) = body.validate() {
        return Err(AppError::BadRequest(errors.to_string()));
    }

    let user_id = user.0;

    let now = Utc::now();

    let collection_doc = Collection {
        id: None,
        user_id,
        name: body.name,
        description: body.description,
        created_at: now,
        updated_at: now,
    };

    let collection = state.db.collection::<Collection>("collections");

    let result = collection
        .insert_one(&collection_doc, None)
        .await
        .map_err(db_error)?;

    let id = result
        .inserted_id
        .as_object_id()
        .ok_or_else(|| AppError::Internal("Missing inserted id".to_string()))?;

    let response = CollectionResponse {
        id: id.to_hex(),
        name: collection_doc.name,
        description: collection_doc.description,
        bookmark_count: 0,
        created_at: collection_doc.created_at,
        updated_at: collection_doc.updated_at,
    };

    Ok((StatusCode::CREATED, Json(response)))
}

pub async fn list_collections(
    State(state): State<AppState>,
    user: AuthenticatedUser,
) -> Result<Json<Vec<CollectionResponse>>, AppError> {
    let user_id = user.0;

    let collection = state.db.collection::<Collection>("collections");

    let pipeline = vec![
        doc! { "$match": { "user_id": user_id } },
        doc! { "$lookup": {
            "from": "bookmarks",
            "localField": "_id",
            "foreignField": "collection_id",
            "as": "bms"
        }},
        doc! { "$addFields": { "bookmark_count": { "$size": "$bms" } } },
        doc! { "$project": { "bms": 0 } },
    ];

    let cursor = collection
        .aggregate(pipeline, None)
        .await
        .map_err(db_error)?;

    let docs: Vec<Document> = cursor.try_collect().await.map_err(db_error)?;

    let response: Vec<CollectionResponse> = docs
        .into_iter()
        .map(collection_response_from_doc)
        .collect::<Result<_, _>>()?;

    Ok(Json(response))
}

pub async fn get_collection(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = user.0;

    let collection_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid collection id".to_string()))?;

    let collection = state.db.collection::<Collection>("collections");
    let bookmarks_col = state.db.collection::<Bookmark>("bookmarks");

    let col = collection
        .find_one(doc! { "_id": collection_id, "user_id": user_id }, None)
        .await
        .map_err(db_error)?
        .ok_or_else(|| AppError::NotFound("Collection not found".to_string()))?;

    let cursor = bookmarks_col
        .find(
            doc! { "collection_id": collection_id, "user_id": user_id },
            None,
        )
        .await
        .map_err(db_error)?;

    let bookmarks: Vec<Bookmark> = cursor.try_collect().await.map_err(db_error)?;

    let bookmark_responses: Vec<BookmarkResponse> =
        bookmarks.into_iter().map(BookmarkResponse::from).collect();

    let response = serde_json::json!({
        "id": col.id.map(|id| id.to_hex()).unwrap_or_default(),
        "name": col.name,
        "description": col.description,
        "bookmarks": bookmark_responses,
        "bookmark_count": bookmark_responses.len(),
        "created_at": col.created_at,
        "updated_at": col.updated_at
    });

    Ok(Json(response))
}

pub async fn update_collection(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<String>,
    Json(body): Json<UpdateCollectionRequest>,
) -> Result<Json<CollectionResponse>, AppError> {
    if let Err(errors) = body.validate() {
        return Err(AppError::BadRequest(errors.to_string()));
    }

    let user_id = user.0;

    let collection_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid collection id".to_string()))?;

    if body.name.is_none() && body.description.is_none() {
        return Err(AppError::BadRequest("No fields to update".to_string()));
    }

    let mut set = doc! { "updated_at": mongodb::bson::DateTime::now() };
    let mut unset = doc! {};

    if let Some(name) = &body.name {
        set.insert("name", name);
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

    let mut update = doc! { "$set": set };
    if !unset.is_empty() {
        update.insert("$unset", unset);
    }

    let collection = state.db.collection::<Collection>("collections");
    let bookmarks_col = state.db.collection::<Bookmark>("bookmarks");

    let result = collection
        .update_one(
            doc! { "_id": collection_id, "user_id": user_id },
            update,
            None,
        )
        .await
        .map_err(db_error)?;

    if result.matched_count == 0 {
        return Err(AppError::NotFound("Collection not found".to_string()));
    }

    let col = collection
        .find_one(doc! { "_id": collection_id, "user_id": user_id }, None)
        .await
        .map_err(db_error)?
        .ok_or_else(|| AppError::NotFound("Collection not found".to_string()))?;

    let count = bookmarks_col
        .count_documents(
            doc! { "collection_id": collection_id, "user_id": user_id },
            None,
        )
        .await
        .unwrap_or(0);

    let response = CollectionResponse {
        id: col.id.map(|id| id.to_hex()).unwrap_or_default(),
        name: col.name,
        description: col.description,
        bookmark_count: count,
        created_at: col.created_at,
        updated_at: col.updated_at,
    };

    Ok(Json(response))
}

pub async fn delete_collection(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<String>,
) -> Result<StatusCode, AppError> {
    let user_id = user.0;

    let collection_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid collection id".to_string()))?;

    let collection = state.db.collection::<Collection>("collections");
    let bookmarks_col = state.db.collection::<Bookmark>("bookmarks");

    let result = collection
        .delete_one(doc! { "_id": collection_id, "user_id": user_id }, None)
        .await
        .map_err(db_error)?;

    if result.deleted_count == 0 {
        return Err(AppError::NotFound("Collection not found".to_string()));
    }

    bookmarks_col
        .update_many(
            doc! { "collection_id": collection_id, "user_id": user_id },
            doc! { "$unset": { "collection_id": "" } },
            None,
        )
        .await
        .map_err(db_error)?;

    Ok(StatusCode::NO_CONTENT)
}
