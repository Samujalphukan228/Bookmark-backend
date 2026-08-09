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
    pub mod bookmark;
    pub mod collection;
    pub mod user;
}

mod handlers {
    pub mod auth;
    pub mod bookmark;
    pub mod collection;
    pub mod import;
    pub mod search;
    pub mod tag;
}

mod routes {
    pub mod auth;
    pub mod bookmark;
    pub mod collection;
    pub mod import;
    pub mod search;
    pub mod tag;
}

mod utils {
    pub mod jwt;
}

mod middleware {
    pub mod auth;
}

use std::sync::Arc;

use axum::extract::DefaultBodyLimit;
use axum::http::{header, HeaderValue, Method};
use axum::middleware as axum_middleware;
use axum::{routing::get, Router};
use tower_governor::governor::GovernorConfigBuilder;
use tower_governor::key_extractor::PeerIpKeyExtractor;
use tower_governor::GovernorLayer;
use tower_http::cors::CorsLayer;
use tower_http::set_header::SetResponseHeaderLayer;

use config::env::EnvConfig;
use db::mongo::connect;
use handlers::auth::me;
use middleware::auth::auth_middleware;
use routes::auth::auth_routes;
use routes::bookmark::bookmark_routes;
use routes::collection::collection_routes;
use routes::import::import_routes;
use routes::search::search_routes;
use routes::tag::tag_routes;
use state::app_state::AppState;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().init();

    let config = EnvConfig::init();

    let database = connect(&config).await.unwrap_or_else(|e| {
        tracing::error!(error = %e, "failed to connect to MongoDB");
        std::process::exit(1);
    });

    let state = AppState {
        db: database,
        jwt_secret: config.jwt_secret.clone(),
    };

    let origins: Vec<HeaderValue> = config
        .allowed_origins
        .iter()
        .map(|o| o.parse::<HeaderValue>().expect("invalid ALLOWED_ORIGINS"))
        .collect();

    let cors = CorsLayer::new()
        .allow_origin(origins)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION])
        .allow_credentials(true);

    let protected = Router::new()
        .route("/me", get(me))
        .nest("/bookmarks", bookmark_routes())
        .nest("/collections", collection_routes())
        .nest("/tags", tag_routes())
        .nest("/search", search_routes())
        .nest("/import", import_routes())
        .layer(axum_middleware::from_fn_with_state(
            state.clone(),
            auth_middleware,
        ));

    let auth_limiter = GovernorConfigBuilder::default()
        .per_second(2)
        .burst_size(10)
        .key_extractor(PeerIpKeyExtractor)
        .finish()
        .expect("failed to build rate limiter");

    let auth_router = auth_routes().layer(GovernorLayer {
        config: Arc::new(auth_limiter),
    });

    let app = Router::new()
        .route("/health", get(|| async { "OK" }))
        .nest("/api/auth", auth_router)
        .nest("/api", protected)
        .layer(cors)
        .layer(DefaultBodyLimit::max(10 * 1024 * 1024))
        .layer(SetResponseHeaderLayer::overriding(
            header::X_CONTENT_TYPE_OPTIONS,
            HeaderValue::from_static("nosniff"),
        ))
        .layer(SetResponseHeaderLayer::overriding(
            header::X_FRAME_OPTIONS,
            HeaderValue::from_static("DENY"),
        ))
        .layer(SetResponseHeaderLayer::overriding(
            header::REFERRER_POLICY,
            HeaderValue::from_static("strict-origin-when-cross-origin"),
        ))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", config.port))
        .await
        .unwrap_or_else(|e| {
            tracing::error!(error = %e, port = config.port, "failed to bind");
            std::process::exit(1);
        });

    tracing::info!("Server running on port {}", config.port);

    axum::serve(listener, app).await.unwrap_or_else(|e| {
        tracing::error!(error = %e, "server error");
        std::process::exit(1);
    });
}
