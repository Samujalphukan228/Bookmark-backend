use axum::{extract::State, http::StatusCode, Json};
use axum_extra::extract::cookie::{Cookie, CookieJar, SameSite};
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::Utc;
use mongodb::bson::doc;
use time::Duration as TimeDuration;
use validator::Validate;

use crate::errors::app_error::AppError;
use crate::middleware::auth::AuthenticatedUser;
use crate::models::user::{LoginRequest, RegisterRequest, User, UserResponse};
use crate::state::app_state::AppState;
use crate::utils::jwt::create_token;

fn normalize_email(email: &str) -> String {
    email.trim().to_lowercase()
}

const SESSION_TTL_SECONDS: i64 = 7 * 24 * 60 * 60;

fn session_cookie<'a>(token: &str, max_age: i64) -> Cookie<'a> {
    Cookie::build(("token", token.to_string()))
        .path("/")
        .http_only(true)
        .same_site(SameSite::None)
        .secure(true)
        .max_age(TimeDuration::seconds(max_age))
        .build()
}

pub async fn register(
    State(state): State<AppState>,
    Json(body): Json<RegisterRequest>,
) -> Result<(StatusCode, Json<UserResponse>), AppError> {
    if let Err(errors) = body.validate() {
        return Err(AppError::BadRequest(errors.to_string()));
    }

    let email = normalize_email(&body.email);
    let collection = state.db.collection::<User>("users");

    let existing = collection
        .find_one(doc! { "email": &email }, None)
        .await
        .map_err(db_error)?;

    if existing.is_some() {
        return Err(AppError::Conflict("Registration failed".to_string()));
    }

    let hashed_password = hash(&body.password, DEFAULT_COST)
        .map_err(|e| AppError::Internal(format!("Failed to hash password: {e}")))?;

    let user = User {
        id: None,
        email: email.clone(),
        password: hashed_password,
        created_at: Utc::now(),
    };

    let result = collection.insert_one(&user, None).await.map_err(db_error)?;

    let user_id = result
        .inserted_id
        .as_object_id()
        .ok_or_else(|| AppError::Internal("Missing inserted id".to_string()))?;

    let response = UserResponse {
        id: user_id.to_hex(),
        email: user.email,
        created_at: user.created_at,
    };

    Ok((StatusCode::CREATED, Json(response)))
}

pub async fn login(
    State(state): State<AppState>,
    jar: CookieJar,
    Json(body): Json<LoginRequest>,
) -> Result<(CookieJar, Json<UserResponse>), AppError> {
    if let Err(errors) = body.validate() {
        return Err(AppError::BadRequest(errors.to_string()));
    }

    let email = normalize_email(&body.email);
    let collection = state.db.collection::<User>("users");

    let user = collection
        .find_one(doc! { "email": &email }, None)
        .await
        .map_err(db_error)?
        .ok_or_else(|| AppError::Unauthorized("Invalid credentials".to_string()))?;

    let valid = verify(&body.password, &user.password)
        .map_err(|e| AppError::Internal(format!("Error verifying password: {e}")))?;

    if !valid {
        return Err(AppError::Unauthorized("Invalid credentials".to_string()));
    }

    let user_id = user
        .id
        .ok_or_else(|| AppError::Internal("Missing user id".to_string()))?;

    let token = create_token(&user_id.to_hex(), &state.jwt_secret)
        .map_err(|e| AppError::Internal(format!("Failed to create token: {e}")))?;

    let cookie = session_cookie(&token, SESSION_TTL_SECONDS);

    let response = UserResponse {
        id: user_id.to_hex(),
        email: user.email,
        created_at: user.created_at,
    };

    Ok((jar.add(cookie), Json(response)))
}

pub async fn logout(jar: CookieJar) -> CookieJar {
    let cookie = session_cookie("", 0);
    jar.remove(cookie)
}

pub async fn me(
    State(state): State<AppState>,
    user: AuthenticatedUser,
) -> Result<Json<UserResponse>, AppError> {
    let collection = state.db.collection::<User>("users");

    let user_doc = collection
        .find_one(doc! { "_id": user.0 }, None)
        .await
        .map_err(db_error)?
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    let response = UserResponse {
        id: user.0.to_hex(),
        email: user_doc.email,
        created_at: user_doc.created_at,
    };

    Ok(Json(response))
}

fn db_error(e: mongodb::error::Error) -> AppError {
    AppError::Internal(format!("Database error: {e}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalizes_email() {
        assert_eq!(normalize_email("  User@Example.COM "), "user@example.com");
    }
}
