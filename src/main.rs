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
}

mod handlers {
    pub mod auth;
}

mod routes {
    pub mod auth;
}

mod utils {
    pub mod jwt;
}


use axum::Router;

use config::env::EnvConfig;
use db::mongo::connect;
use state::app_state::AppState;
use routes::auth::auth_routes;


#[tokio::main]
async fn main() {

    let config = EnvConfig::init();

    let database = connect(&config).await;

    let state = AppState {
        db: database,
        jwt_secret: config.jwt_secret,
    };

    let app = Router::new()
        .nest("/api/auth", auth_routes())
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