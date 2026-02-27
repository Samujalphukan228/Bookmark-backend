use axum::{
    body::Body,
    extract::State,
    http::{Request, StatusCode},
    middleware::Next,
    response::Response,
};
use axum_extra::extract::CookieJar;

use crate::state::app_state::AppState;
use crate::utils::jwt::verify_token;

pub async fn auth_middleware(
    State(state): State<AppState>,
    jar: CookieJar,
    mut request: Request<Body>,
    next: Next,
) -> Result<Response, StatusCode> {

    let token = jar
        .get("token")
        .map(|c| c.value().to_string())
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let claims = verify_token(&token, &state.jwt_secret)
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    request.extensions_mut().insert(claims);

    Ok(next.run(request).await)
}