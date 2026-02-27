use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use mongodb::bson::doc;
use bcrypt::{hash, DEFAULT_COST};
use chrono::Utc;
use validator::Validate;

use crate::state::app_state::AppState;
use crate::models::user::{User, RegisterRequest, UserResponse};

pub async fn register(
    State(state): State<AppState>,
    Json(body): Json<RegisterRequest>,
) -> Result<(StatusCode, Json<UserResponse>), (StatusCode, String)> {

    // Validate input
    if let Err(errors) = body.validate() {
        return Err((StatusCode::BAD_REQUEST, errors.to_string()));
    }

    let collection = state.db.collection::<User>("users");

    // Check if user exists
    let existing = collection
        .find_one(doc! { "email": &body.email }, None)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    if existing.is_some() {
        return Err((StatusCode::CONFLICT, "Email already exists".to_string()));
    }

    // Hash password
    let hashed_password = hash(&body.password, DEFAULT_COST)
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to hash password".to_string()))?;

    // Create user
    let user = User {
        id: None,
        email: body.email.clone(),
        password: hashed_password,
        created_at: Utc::now(),
    };

    // Insert user
    let result = collection
        .insert_one(&user, None)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create user".to_string()))?;

    // Response
    let response = UserResponse {
        id: result.inserted_id.as_object_id().unwrap().to_hex(),
        email: user.email,
        created_at: user.created_at,
    };

    Ok((StatusCode::CREATED, Json(response)))
}