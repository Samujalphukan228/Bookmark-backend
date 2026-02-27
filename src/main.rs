mod config {
    pub mod env;
}

mod db {
    pub mod mongo;
}

mod state {
    pub mod app_state;
}

mod errors {
    pub mod app_error;
}

mod models {
    pub mod user;
    pub mod bookmark;
    pub mod collection;
}

mod handlers {
    pub mod auth;
    pub mod bookmark;
    pub mod collection;
    pub mod tag;
}

mod routes {
    pub mod auth;
    pub mod bookmark;
    pub mod collection;
    pub mod tag;
}

mod utils {
    pub mod jwt;
}

mod middleware {
    pub mod auth;
}


use axum::{Router, routing::get, middleware as axum_middleware};

use config::env::EnvConfig;
use db::mongo::connect;
use state::app_state::AppState;
use routes::auth::auth_routes;
use routes::bookmark::bookmark_routes;
use routes::collection::collection_routes;
use routes::tag::tag_routes;
use middleware::auth::auth_middleware;
use handlers::auth::me;


#[tokio::main]
async fn main() {

    let config = EnvConfig::init();

    let database = connect(&config).await;

    let state = AppState {
        db: database,
        jwt_secret: config.jwt_secret,
    };

    // Protected routes
    let protected = Router::new()
        .route("/me", get(me))
        .nest("/bookmarks", bookmark_routes())
        .nest("/collections", collection_routes())
        .nest("/tags", tag_routes())
        .layer(axum_middleware::from_fn_with_state(state.clone(), auth_middleware));

    let app = Router::new()
        .nest("/api/auth", auth_routes())
        .nest("/api", protected)
        .with_state(state);

    let listener = tokio::net::TcpListener
        ::bind(format!("0.0.0.0:{}", config.port))
        .await
        .unwrap();

    println!("Server running on port {}", config.port);

    axum::serve(listener, app)
        .await
        .unwrap();
}