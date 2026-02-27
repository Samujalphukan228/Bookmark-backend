use axum::{
    extract::State,
    http::StatusCode,
    Json,
    Extension,
};
use axum_extra::extract::cookie::{CookieJar, Cookie};
use mongodb::bson::doc;
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::Utc;
use validator::Validate;

use crate::state::app_state::AppState;
use crate::models::user::{
    User,
    RegisterRequest,
    UserResponse,
    LoginRequest,
};
use crate::utils::jwt::{create_token, Claims};


pub async fn register(
    State(state): State<AppState>,
    Json(body): Json<RegisterRequest>,
) -> Result<(StatusCode, Json<UserResponse>), (StatusCode, String)> {

    if let Err(errors) = body.validate() {
        return Err((StatusCode::BAD_REQUEST, errors.to_string()));
    }

    let collection = state.db.collection::<User>("users");

    let existing = collection
        .find_one(doc! { "email": &body.email }, None)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    if existing.is_some() {
        return Err((StatusCode::CONFLICT, "Email already exists".to_string()));
    }

    let hashed_password = hash(&body.password, DEFAULT_COST)
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to hash password".to_string()))?;

    let user = User {
        id: None,
        email: body.email.clone(),
        password: hashed_password,
        created_at: Utc::now(),
    };

    let result = collection
        .insert_one(&user, None)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create user".to_string()))?;

    let response = UserResponse {
        id: result.inserted_id.as_object_id().unwrap().to_hex(),
        email: user.email,
        created_at: user.created_at,
    };

    Ok((StatusCode::CREATED, Json(response)))
}


pub async fn login(
    State(state): State<AppState>,
    jar: CookieJar,
    Json(body): Json<LoginRequest>,
) -> Result<(CookieJar, Json<UserResponse>), (StatusCode, String)> {

    if let Err(errors) = body.validate() {
        return Err((StatusCode::BAD_REQUEST, errors.to_string()));
    }

    let collection = state.db.collection::<User>("users");

    let user = collection
        .find_one(doc! { "email": &body.email }, None)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?
        .ok_or((StatusCode::UNAUTHORIZED, "Invalid credentials".to_string()))?;

    let valid = verify(&body.password, &user.password)
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Error verifying password".to_string()))?;

    if !valid {
        return Err((StatusCode::UNAUTHORIZED, "Invalid credentials".to_string()));
    }

    let user_id = user.id.unwrap().to_hex();

    let token = create_token(&user_id, &state.jwt_secret)
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create token".to_string()))?;

    let cookie = Cookie::build(("token", token))
        .path("/")
        .http_only(true)
        .build();

    let response = UserResponse {
        id: user_id,
        email: user.email,
        created_at: user.created_at,
    };

    Ok((jar.add(cookie), Json(response)))
}


pub async fn logout(
    jar: CookieJar,
) -> CookieJar {

    jar.remove(Cookie::from("token"))
}


pub async fn me(
    Extension(claims): Extension<Claims>,
) -> Result<Json<serde_json::Value>, StatusCode> {

    Ok(Json(serde_json::json!({
        "user_id": claims.sub
    })))
}