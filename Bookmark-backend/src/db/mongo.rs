use mongodb::bson::doc;
use mongodb::options::IndexOptions;
use mongodb::{bson::Document, Client, Database, IndexModel};
use tracing::{info, warn};

use crate::config::env::EnvConfig;

pub async fn connect(config: &EnvConfig) -> Result<Database, mongodb::error::Error> {
    let client = Client::with_uri_str(&config.mongo_uri).await?;

    client
        .database("admin")
        .run_command(doc! { "ping": 1 }, None)
        .await?;

    info!("MongoDB connected");

    let db = client.database(&config.db_name);

    create_indexes(&db).await;

    Ok(db)
}

async fn create_indexes(db: &Database) {
    let bookmarks = db.collection::<Document>("bookmarks");
    let users = db.collection::<Document>("users");

    if let Err(e) = bookmarks.drop_index("bookmark_text_index", None).await {
        warn!(error = %e, "could not drop legacy text index (ignoring)");
    }

    let bookmark_indexes = vec![
        IndexModel::builder()
            .keys(doc! { "user_id": 1 })
            .options(
                IndexOptions::builder()
                    .name("bookmarks_user_id".to_string())
                    .build(),
            )
            .build(),
        IndexModel::builder()
            .keys(doc! { "user_id": 1, "collection_id": 1 })
            .options(
                IndexOptions::builder()
                    .name("bookmarks_user_collection".to_string())
                    .build(),
            )
            .build(),
        IndexModel::builder()
            .keys(doc! { "user_id": 1, "tags": 1 })
            .options(
                IndexOptions::builder()
                    .name("bookmarks_user_tags".to_string())
                    .build(),
            )
            .build(),
        IndexModel::builder()
            .keys(doc! { "user_id": 1, "url": 1 })
            .options(
                IndexOptions::builder()
                    .name("bookmarks_user_url".to_string())
                    .build(),
            )
            .build(),
        IndexModel::builder()
            .keys(doc! { "title": "text", "description": "text", "url": "text", "tags": "text" })
            .options(
                IndexOptions::builder()
                    .name("bookmark_text_index".to_string())
                    .build(),
            )
            .build(),
    ];

    if let Err(e) = bookmarks.create_indexes(bookmark_indexes, None).await {
        warn!(error = %e, "failed to create bookmark indexes (ignoring)");
    }

    let email_index = IndexModel::builder()
        .keys(doc! { "email": 1 })
        .options(
            IndexOptions::builder()
                .unique(true)
                .name("users_email_unique".to_string())
                .build(),
        )
        .build();

    if let Err(e) = users.create_index(email_index, None).await {
        warn!(error = %e, "failed to create users email index (ignoring)");
    }

    info!("Indexes ensured");
}
