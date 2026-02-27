use axum::{
    routing::post,
    Router,
};

use crate::state::app_state::AppState;
use crate::handlers::auth::{register, login};

pub fn auth_routes() -> Router<AppState> {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
}