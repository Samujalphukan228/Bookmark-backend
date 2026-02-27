use mongodb::{Client, Database, IndexModel};
use mongodb::bson::doc;
use mongodb::options::IndexOptions;

use crate::config::env::EnvConfig;

pub async fn connect(config: &EnvConfig) -> Database {

    let client = Client::with_uri_str(&config.mongo_uri)
        .await
        .expect("Failed to create MongoDB client");

    client
        .database("admin")
        .run_command(doc! { "ping": 1 }, None)
        .await
        .expect("Failed to connect to MongoDB");

    println!("MongoDB connected successfully");

    let db = client.database(&config.db_name);

    // Create text index for search
    create_indexes(&db).await;

    db
}

async fn create_indexes(db: &Database) {

    let bookmarks = db.collection::<mongodb::bson::Document>("bookmarks");

    let index = IndexModel::builder()
        .keys(doc! {
            "title": "text",
            "description": "text",
            "url": "text"
        })
        .options(
            IndexOptions::builder()
                .name("bookmark_text_index".to_string())
                .build()
        )
        .build();

    bookmarks
        .create_index(index, None)
        .await
        .expect("Failed to create text index");

    println!("Indexes created successfully");
}