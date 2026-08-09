use std::collections::{HashMap, HashSet};

use axum::{extract::State, Json};
use axum_extra::extract::Multipart;
use chrono::Utc;
use futures::TryStreamExt;
use mongodb::bson::{doc, oid::ObjectId};
use scraper::{ElementRef, Html, Selector};

use crate::errors::app_error::AppError;
use crate::middleware::auth::AuthenticatedUser;
use crate::models::bookmark::Bookmark;
use crate::models::collection::Collection;
use crate::state::app_state::AppState;

const MAX_IMPORT_BYTES: usize = 10 * 1024 * 1024;

struct ParsedBookmark {
    title: String,
    url: String,
    folder: Option<String>,
}

struct BookmarkParser {
    dt: Selector,
    h3: Selector,
    a: Selector,
    dl: Selector,
}

impl BookmarkParser {
    fn new() -> Self {
        Self {
            dt: Selector::parse("dt").unwrap(),
            h3: Selector::parse("h3").unwrap(),
            a: Selector::parse("a").unwrap(),
            dl: Selector::parse("dl").unwrap(),
        }
    }

    fn parse(&self, html: &str) -> Vec<ParsedBookmark> {
        let document = Html::parse_document(html);
        let mut bookmarks = Vec::new();

        if let Some(root) = document.select(&self.dl).next() {
            self.walk(root, "", &mut bookmarks);
        }

        let mut seen = HashSet::new();
        bookmarks.retain(|b| seen.insert(b.url.clone()));

        bookmarks
    }

    fn walk(&self, dl: ElementRef, folder: &str, out: &mut Vec<ParsedBookmark>) {
        for dt in dl.select(&self.dt) {
            if let Some(h3) = dt.select(&self.h3).next() {
                let name = h3.text().collect::<String>().trim().to_string();
                if name.is_empty() {
                    continue;
                }

                let path = if folder.is_empty() {
                    name.clone()
                } else {
                    format!("{folder}/{name}")
                };

                let nested_dl = dt.next_siblings().find_map(|s| {
                    let el = ElementRef::wrap(s)?;
                    if el.value().name() == "dd" {
                        el.select(&self.dl).next()
                    } else {
                        None
                    }
                });

                if let Some(inner) = nested_dl {
                    self.walk(inner, &path, out);
                }
            } else if let Some(a) = dt.select(&self.a).next() {
                let url = a.value().attr("href").unwrap_or("").to_string();
                let title = a.text().collect::<String>();

                if url.starts_with("http") {
                    out.push(ParsedBookmark {
                        title: if title.trim().is_empty() {
                            url.clone()
                        } else {
                            title.trim().to_string()
                        },
                        url,
                        folder: if folder.is_empty() {
                            None
                        } else {
                            Some(folder.to_string())
                        },
                    });
                }
            }
        }
    }
}

fn db_error(e: mongodb::error::Error) -> AppError {
    AppError::Internal(format!("Database error: {e}"))
}

pub async fn import_bookmarks(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    mut multipart: Multipart,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = user.0;

    let mut html_content = String::new();

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|_| AppError::BadRequest("Failed to read file".to_string()))?
    {
        let name = field.name().unwrap_or("").to_string();

        if name == "file" {
            let bytes = field
                .bytes()
                .await
                .map_err(|_| AppError::BadRequest("Failed to read file bytes".to_string()))?;

            if bytes.len() > MAX_IMPORT_BYTES {
                return Err(AppError::BadRequest(
                    "File too large (max 10MB)".to_string(),
                ));
            }

            html_content = String::from_utf8(bytes.to_vec())
                .map_err(|_| AppError::BadRequest("Invalid file encoding".to_string()))?;
        }
    }

    if html_content.is_empty() {
        return Err(AppError::BadRequest("No file uploaded".to_string()));
    }

    let parsed = BookmarkParser::new().parse(&html_content);

    if parsed.is_empty() {
        return Err(AppError::BadRequest(
            "No bookmarks found in file".to_string(),
        ));
    }

    let bookmarks_col = state.db.collection::<Bookmark>("bookmarks");
    let collections_col = state.db.collection::<Collection>("collections");

    let urls: Vec<&str> = parsed.iter().map(|b| b.url.as_str()).collect();

    let existing_urls: HashSet<String> = bookmarks_col
        .find(doc! { "user_id": user_id, "url": { "$in": urls } }, None)
        .await
        .map_err(db_error)?
        .try_collect::<Vec<Bookmark>>()
        .await
        .map_err(db_error)?
        .into_iter()
        .map(|b| b.url)
        .collect();

    let skipped = parsed
        .iter()
        .filter(|b| existing_urls.contains(&b.url))
        .count();

    let existing_cols: Vec<Collection> = collections_col
        .find(doc! { "user_id": user_id }, None)
        .await
        .map_err(db_error)?
        .try_collect()
        .await
        .map_err(db_error)?;

    let mut folder_map: HashMap<String, ObjectId> = existing_cols
        .into_iter()
        .filter_map(|c| c.id.map(|id| (c.name, id)))
        .collect();

    let needed_folders: HashSet<&String> =
        parsed.iter().filter_map(|b| b.folder.as_ref()).collect();

    let now = Utc::now();
    let mut new_collections: Vec<Collection> = Vec::new();

    for folder in needed_folders {
        if !folder_map.contains_key(folder) {
            let id = ObjectId::new();
            folder_map.insert(folder.clone(), id);
            new_collections.push(Collection {
                id: Some(id),
                user_id,
                name: folder.clone(),
                description: None,
                created_at: now,
                updated_at: now,
            });
        }
    }

    let collections_created = new_collections.len();

    if !new_collections.is_empty() {
        collections_col
            .insert_many(new_collections, None)
            .await
            .map_err(db_error)?;
    }

    let to_insert: Vec<Bookmark> = parsed
        .into_iter()
        .filter(|b| !existing_urls.contains(&b.url))
        .map(|b| Bookmark {
            id: Some(ObjectId::new()),
            user_id,
            title: b.title,
            url: b.url,
            description: None,
            tags: vec![],
            collection_id: b.folder.as_ref().and_then(|f| folder_map.get(f).copied()),
            created_at: now,
            updated_at: now,
        })
        .collect();

    let imported = to_insert.len();

    if !to_insert.is_empty() {
        bookmarks_col
            .insert_many(to_insert, None)
            .await
            .map_err(db_error)?;
    }

    Ok(Json(serde_json::json!({
        "message": "Import complete",
        "imported": imported,
        "skipped": skipped,
        "collections_created": collections_created
    })))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_flat_bookmarks() {
        let html = r#"
            <dl><p>
                <dt><a href="https://example.com">Example</a></dt>
                <dt><a href="https://rust-lang.org">Rust</a></dt>
            </p></dl>
        "#;

        let parsed = BookmarkParser::new().parse(html);

        assert_eq!(parsed.len(), 2);
        assert_eq!(parsed[0].title, "Example");
        assert_eq!(parsed[0].url, "https://example.com");
        assert!(parsed[0].folder.is_none());
    }

    #[test]
    fn parses_nested_folders_without_duplicates() {
        let html = r#"
            <dl><p>
                <dt><h3>Root</h3></dt>
                <dd><dl><p>
                    <dt><h3>Dev</h3></dt>
                    <dd><dl><p>
                        <dt><a href="https://github.com">GitHub</a></dt>
                    </p></dl></dd>
                    <dt><a href="https://docs.rs">Docs</a></dt>
                </p></dl></dd>
                <dt><a href="https://top.com">Top</a></dt>
            </p></dl>
        "#;

        let parsed = BookmarkParser::new().parse(html);

        assert_eq!(parsed.len(), 3);
        assert!(parsed
            .iter()
            .any(|b| b.url == "https://github.com" && b.folder.as_deref() == Some("Root/Dev")));
        assert!(parsed
            .iter()
            .any(|b| b.url == "https://docs.rs" && b.folder.as_deref() == Some("Root")));
        assert!(parsed
            .iter()
            .any(|b| b.url == "https://top.com" && b.folder.is_none()));
    }

    #[test]
    fn ignores_non_http_links() {
        let html = r#"
            <dl><p>
                <dt><a href="javascript:void(0)">Bad</a></dt>
                <dt><a href="mailto:x@y.com">Mail</a></dt>
                <dt><a href="https://good.com">Good</a></dt>
            </p></dl>
        "#;

        let parsed = BookmarkParser::new().parse(html);
        assert_eq!(parsed.len(), 1);
        assert_eq!(parsed[0].url, "https://good.com");
    }
}
