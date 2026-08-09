use axum::{routing::post, Router};

use crate::handlers::auth::{login, logout, register};
use crate::state::app_state::AppState;

pub fn auth_routes() -> Router<AppState> {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/logout", post(logout))
}
