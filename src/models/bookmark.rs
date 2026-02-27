use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Bookmark {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,

    pub user_id: ObjectId,

    pub title: String,

    pub url: String,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    #[serde(default)]
    pub tags: Vec<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub collection_id: Option<ObjectId>,

    pub created_at: DateTime<Utc>,

    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateBookmarkRequest {
    #[validate(length(min = 1, message = "Title required"))]
    pub title: String,

    #[validate(url(message = "Invalid URL"))]
    pub url: String,

    pub description: Option<String>,

    #[serde(default)]
    pub tags: Vec<String>,

    pub collection_id: Option<String>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateBookmarkRequest {
    #[validate(length(min = 1, message = "Title required"))]
    pub title: Option<String>,

    #[validate(url(message = "Invalid URL"))]
    pub url: Option<String>,

    pub description: Option<String>,

    pub tags: Option<Vec<String>>,

    pub collection_id: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct BookmarkResponse {
    pub id: String,
    pub title: String,
    pub url: String,
    pub description: Option<String>,
    pub tags: Vec<String>,
    pub collection_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<Bookmark> for BookmarkResponse {
    fn from(b: Bookmark) -> Self {
        Self {
            id: b.id.unwrap().to_hex(),
            title: b.title,
            url: b.url,
            description: b.description,
            tags: b.tags,
            collection_id: b.collection_id.map(|id| id.to_hex()),
            created_at: b.created_at,
            updated_at: b.updated_at,
        }
    }
}