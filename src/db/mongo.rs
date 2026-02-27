use mongodb::{Client, Database};
use mongodb::bson::doc;

use crate::config::env::EnvConfig;

pub async fn connect(config: &EnvConfig) -> Database {

    let client = Client::with_uri_str(&config.mongo_uri)
        .await
        .expect("Failed to create MongoDB client");

    // Ping to verify connection
    client
        .database("admin")
        .run_command(doc! { "ping": 1 }, None)
        .await
        .expect("Failed to connect to MongoDB");

    println!("MongoDB connected successfully");

    client.database(&config.db_name)
}