use axum::{
    extract::State,
    http::StatusCode,
    Json,
    Extension,
};
use axum_extra::extract::Multipart;
use mongodb::bson::{doc, oid::ObjectId};
use chrono::Utc;
use scraper::{Html, Selector};

use crate::state::app_state::AppState;
use crate::models::bookmark::Bookmark;
use crate::models::collection::Collection;
use crate::utils::jwt::Claims;


// Parsed bookmark from HTML
struct ParsedBookmark {
    title: String,
    url: String,
    folder: Option<String>,
}


// Parse browser HTML export
fn parse_bookmarks_html(html: &str) -> Vec<ParsedBookmark> {

    let document = Html::parse_document(html);
    let mut bookmarks = Vec::new();
    let mut current_folder: Option<String> = None;

    // Select all h3 (folders) and a (links)
    let h3_selector = Selector::parse("h3").unwrap();
    let a_selector = Selector::parse("a").unwrap();
    let dl_selector = Selector::parse("dl").unwrap();

    // Get all DL elements (folders)
    let dls: Vec<_> = document.select(&dl_selector).collect();

    for dl in dls {

        // Check if there is an H3 before this DL (folder name)
        let folder_name = dl
            .prev_siblings()
            .find(|s| {
                s.value().is_element()
            })
            .and_then(|s| {
                let el = scraper::ElementRef::wrap(s)?;
                if el.value().name() == "h3" {
                    Some(el.text().collect::<String>())
                } else {
                    None
                }
            });

        if folder_name.is_some() {
            current_folder = folder_name;
        }

        // Get all links in this DL
        for a in dl.select(&a_selector) {
            let url = a.value().attr("href").unwrap_or("").to_string();
            let title = a.text().collect::<String>();

            if url.starts_with("http") {
                bookmarks.push(ParsedBookmark {
                    title: if title.is_empty() { url.clone() } else { title },
                    url,
                    folder: current_folder.clone(),
                });
            }
        }
    }

    // Also get top level links (not in any folder)
    let top_level: Vec<_> = document.select(&a_selector).collect();
    for a in top_level {
        let url = a.value().attr("href").unwrap_or("").to_string();
        let title = a.text().collect::<String>();

        if url.starts_with("http") {
            let already_added = bookmarks.iter().any(|b| b.url == url);
            if !already_added {
                bookmarks.push(ParsedBookmark {
                    title: if title.is_empty() { url.clone() } else { title },
                    url,
                    folder: None,
                });
            }
        }
    }

    bookmarks
}


pub async fn import_bookmarks(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    mut multipart: Multipart,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {

    let user_id = ObjectId::parse_str(&claims.sub)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid user id".to_string()))?;

    // Get uploaded file
    let mut html_content = String::new();

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|_| (StatusCode::BAD_REQUEST, "Failed to read file".to_string()))?
    {
        let name = field.name().unwrap_or("").to_string();

        if name == "file" {
            let bytes = field
                .bytes()
                .await
                .map_err(|_| (StatusCode::BAD_REQUEST, "Failed to read file bytes".to_string()))?;

            html_content = String::from_utf8(bytes.to_vec())
                .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid file encoding".to_string()))?;
        }
    }

    if html_content.is_empty() {
        return Err((StatusCode::BAD_REQUEST, "No file uploaded".to_string()));
    }

    // Parse bookmarks from HTML
    let parsed = parse_bookmarks_html(&html_content);

    if parsed.is_empty() {
        return Err((StatusCode::BAD_REQUEST, "No bookmarks found in file".to_string()));
    }

    let bookmarks_col = state.db.collection::<Bookmark>("bookmarks");
    let collections_col = state.db.collection::<Collection>("collections");

    let mut folder_map: std::collections::HashMap<String, ObjectId> = std::collections::HashMap::new();
    let mut imported_count = 0;
    let mut skipped_count = 0;

    for parsed_bookmark in parsed {

        // Skip if URL already exists for this user
        let existing = bookmarks_col
            .find_one(
                doc! { "user_id": user_id, "url": &parsed_bookmark.url },
                None,
            )
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

        if existing.is_some() {
            skipped_count += 1;
            continue;
        }

        // Get or create collection for folder
        let collection_id = if let Some(folder_name) = &parsed_bookmark.folder {

            if let Some(id) = folder_map.get(folder_name) {
                Some(*id)
            } else {

                // Check if collection already exists
                let existing_col = collections_col
                    .find_one(
                        doc! { "user_id": user_id, "name": folder_name },
                        None,
                    )
                    .await
                    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

                let col_id = if let Some(col) = existing_col {
                    col.id.unwrap()
                } else {
                    // Create new collection
                    let now = Utc::now();
                    let new_col = Collection {
                        id: None,
                        user_id,
                        name: folder_name.clone(),
                        description: None,
                        created_at: now,
                        updated_at: now,
                    };

                    let result = collections_col
                        .insert_one(&new_col, None)
                        .await
                        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create collection".to_string()))?;

                    result.inserted_id.as_object_id().unwrap()
                };

                folder_map.insert(folder_name.clone(), col_id);
                Some(col_id)
            }
        } else {
            None
        };

        // Create bookmark
        let now = Utc::now();
        let bookmark = Bookmark {
            id: None,
            user_id,
            title: parsed_bookmark.title,
            url: parsed_bookmark.url,
            description: None,
            tags: vec![],
            collection_id,
            created_at: now,
            updated_at: now,
        };

        bookmarks_col
            .insert_one(&bookmark, None)
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to save bookmark".to_string()))?;

        imported_count += 1;
    }

    Ok(Json(serde_json::json!({
        "message": "Import complete",
        "imported": imported_count,
        "skipped": skipped_count,
        "collections_created": folder_map.len()
    })))
}