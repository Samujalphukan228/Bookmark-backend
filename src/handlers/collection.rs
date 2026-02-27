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
use crate::models::collection::{
    Collection,
    CreateCollectionRequest,
    UpdateCollectionRequest,
    CollectionResponse,
};
use crate::models::bookmark::{Bookmark, BookmarkResponse};
use crate::utils::jwt::Claims;


// Create collection
pub async fn create_collection(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Json(body): Json<CreateCollectionRequest>,
) -> Result<(StatusCode, Json<CollectionResponse>), (StatusCode, String)> {

    if let Err(errors) = body.validate() {
        return Err((StatusCode::BAD_REQUEST, errors.to_string()));
    }

    let user_id = ObjectId::parse_str(&claims.sub)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid user id".to_string()))?;

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
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create collection".to_string()))?;

    let response = CollectionResponse {
        id: result.inserted_id.as_object_id().unwrap().to_hex(),
        name: collection_doc.name,
        description: collection_doc.description,
        bookmark_count: 0,
        created_at: collection_doc.created_at,
        updated_at: collection_doc.updated_at,
    };

    Ok((StatusCode::CREATED, Json(response)))
}


// List all collections for user
pub async fn list_collections(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
) -> Result<Json<Vec<CollectionResponse>>, (StatusCode, String)> {

    let user_id = ObjectId::parse_str(&claims.sub)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid user id".to_string()))?;

    let collection = state.db.collection::<Collection>("collections");
    let bookmarks_col = state.db.collection::<Bookmark>("bookmarks");

    let cursor = collection
        .find(doc! { "user_id": user_id }, None)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    let collections: Vec<Collection> = cursor
        .try_collect()
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch collections".to_string()))?;

    let mut response: Vec<CollectionResponse> = Vec::new();

    for col in collections {
        let col_id = col.id.unwrap();

        let count = bookmarks_col
            .count_documents(doc! { "collection_id": col_id, "user_id": user_id }, None)
            .await
            .unwrap_or(0);

        response.push(CollectionResponse {
            id: col_id.to_hex(),
            name: col.name,
            description: col.description,
            bookmark_count: count,
            created_at: col.created_at,
            updated_at: col.updated_at,
        });
    }

    Ok(Json(response))
}


// Get collection with its bookmarks
pub async fn get_collection(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {

    let user_id = ObjectId::parse_str(&claims.sub)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid user id".to_string()))?;

    let collection_id = ObjectId::parse_str(&id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid collection id".to_string()))?;

    let collection = state.db.collection::<Collection>("collections");
    let bookmarks_col = state.db.collection::<Bookmark>("bookmarks");

    // Get collection
    let col = collection
        .find_one(doc! { "_id": collection_id, "user_id": user_id }, None)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?
        .ok_or((StatusCode::NOT_FOUND, "Collection not found".to_string()))?;

    // Get bookmarks in collection
    let cursor = bookmarks_col
        .find(doc! { "collection_id": collection_id, "user_id": user_id }, None)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    let bookmarks: Vec<Bookmark> = cursor
        .try_collect()
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch bookmarks".to_string()))?;

    let bookmark_responses: Vec<BookmarkResponse> = bookmarks
        .into_iter()
        .map(BookmarkResponse::from)
        .collect();

    let response = serde_json::json!({
        "id": col.id.unwrap().to_hex(),
        "name": col.name,
        "description": col.description,
        "bookmarks": bookmark_responses,
        "bookmark_count": bookmark_responses.len(),
        "created_at": col.created_at,
        "updated_at": col.updated_at
    });

    Ok(Json(response))
}


// Update collection
pub async fn update_collection(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<String>,
    Json(body): Json<UpdateCollectionRequest>,
) -> Result<Json<CollectionResponse>, (StatusCode, String)> {

    let user_id = ObjectId::parse_str(&claims.sub)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid user id".to_string()))?;

    let collection_id = ObjectId::parse_str(&id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid collection id".to_string()))?;

    let collection = state.db.collection::<Collection>("collections");
    let bookmarks_col = state.db.collection::<Bookmark>("bookmarks");

    let mut update_doc = doc! {
        "updated_at": Utc::now().to_rfc3339()
    };

    if let Some(name) = &body.name {
        update_doc.insert("name", name);
    }
    if let Some(description) = &body.description {
        update_doc.insert("description", description);
    }

    collection
        .update_one(
            doc! { "_id": collection_id, "user_id": user_id },
            doc! { "$set": update_doc },
            None,
        )
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to update collection".to_string()))?;

    let col = collection
        .find_one(doc! { "_id": collection_id, "user_id": user_id }, None)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?
        .ok_or((StatusCode::NOT_FOUND, "Collection not found".to_string()))?;

    let count = bookmarks_col
        .count_documents(doc! { "collection_id": collection_id, "user_id": user_id }, None)
        .await
        .unwrap_or(0);

    let response = CollectionResponse {
        id: col.id.unwrap().to_hex(),
        name: col.name,
        description: col.description,
        bookmark_count: count,
        created_at: col.created_at,
        updated_at: col.updated_at,
    };

    Ok(Json(response))
}


// Delete collection
pub async fn delete_collection(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<String>,
) -> Result<StatusCode, (StatusCode, String)> {

    let user_id = ObjectId::parse_str(&claims.sub)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid user id".to_string()))?;

    let collection_id = ObjectId::parse_str(&id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid collection id".to_string()))?;

    let collection = state.db.collection::<Collection>("collections");
    let bookmarks_col = state.db.collection::<Bookmark>("bookmarks");

    // Delete collection
    let result = collection
        .delete_one(doc! { "_id": collection_id, "user_id": user_id }, None)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to delete collection".to_string()))?;

    if result.deleted_count == 0 {
        return Err((StatusCode::NOT_FOUND, "Collection not found".to_string()));
    }

    // Remove collection_id from bookmarks (don't delete bookmarks)
    bookmarks_col
        .update_many(
            doc! { "collection_id": collection_id, "user_id": user_id },
            doc! { "$unset": { "collection_id": "" } },
            None,
        )
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to update bookmarks".to_string()))?;

    Ok(StatusCode::NO_CONTENT)
}