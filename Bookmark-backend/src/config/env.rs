use std::env;

use axum::http::HeaderValue;

pub struct EnvConfig {
    pub port: u16,
    pub mongo_uri: String,
    pub db_name: String,
    pub jwt_secret: String,
    pub allowed_origins: Vec<String>,
}

impl EnvConfig {
    pub fn init() -> Self {
        dotenvy::dotenv().ok();

        let allowed_origins = env::var("ALLOWED_ORIGINS")
            .unwrap_or("http://localhost:3001".to_string())
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect::<Vec<_>>();

        if allowed_origins.is_empty() {
            panic!("ALLOWED_ORIGINS must contain at least one origin");
        }

        for origin in &allowed_origins {
            origin
                .parse::<HeaderValue>()
                .unwrap_or_else(|e| panic!("Invalid origin in ALLOWED_ORIGINS: '{origin}' ({e})"));
        }

        Self {
            port: env::var("PORT")
                .ok()
                .map(|p| {
                    p.parse::<u16>()
                        .unwrap_or_else(|e| panic!("Invalid PORT '{p}': {e}"))
                })
                .unwrap_or(3000),

            mongo_uri: env::var("MONGO_URI").expect("MONGO_URI missing"),

            db_name: env::var("DB_NAME").expect("DB_NAME missing"),

            jwt_secret: env::var("JWT_SECRET").expect("JWT_SECRET missing"),

            allowed_origins,
        }
    }
}
