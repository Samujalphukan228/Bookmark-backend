use chrono::{DateTime, Utc};
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Collection {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,

    pub user_id: ObjectId,

    pub name: String,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    pub created_at: DateTime<Utc>,

    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateCollectionRequest {
    #[validate(length(min = 1, message = "Name required"))]
    pub name: String,

    pub description: Option<String>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateCollectionRequest {
    #[validate(length(min = 1, message = "Name required"))]
    pub name: Option<String>,

    pub description: Option<Option<String>>,
}

#[derive(Debug, Serialize)]
pub struct CollectionResponse {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub bookmark_count: u64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
