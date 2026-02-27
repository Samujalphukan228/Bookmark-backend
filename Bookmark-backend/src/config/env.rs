use std::env;

pub struct EnvConfig {
    pub port: String,
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
            .collect();

        Self {
            port: env::var("PORT")
                .unwrap_or("3000".to_string()),

            mongo_uri: env::var("MONGO_URI")
                .expect("MONGO_URI missing"),

            db_name: env::var("DB_NAME")
                .expect("DB_NAME missing"),

            jwt_secret: env::var("JWT_SECRET")
                .expect("JWT_SECRET missing"),

            allowed_origins,
        }
    }
}