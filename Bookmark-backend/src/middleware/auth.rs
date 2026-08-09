use axum::{
    body::Body,
    extract::{FromRequestParts, State},
    http::request::Parts,
    http::Request,
    middleware::Next,
    response::Response,
};
use axum_extra::extract::CookieJar;
use mongodb::bson::oid::ObjectId;

use crate::errors::app_error::AppError;
use crate::state::app_state::AppState;
use crate::utils::jwt::{verify_token, Claims};

pub async fn auth_middleware(
    State(state): State<AppState>,
    jar: CookieJar,
    mut request: Request<Body>,
    next: Next,
) -> Result<Response, AppError> {
    let token = jar
        .get("token")
        .map(|c| c.value().to_string())
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;

    let claims = verify_token(&token, &state.jwt_secret)
        .map_err(|_| AppError::Unauthorized("Invalid or expired session".to_string()))?;

    request.extensions_mut().insert(claims);

    Ok(next.run(request).await)
}

pub struct AuthenticatedUser(pub ObjectId);

#[async_trait::async_trait]
impl FromRequestParts<AppState> for AuthenticatedUser {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        _state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let claims = parts
            .extensions
            .get::<Claims>()
            .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;

        let user_id = ObjectId::parse_str(&claims.sub)
            .map_err(|_| AppError::Unauthorized("Invalid session".to_string()))?;

        Ok(AuthenticatedUser(user_id))
    }
}
