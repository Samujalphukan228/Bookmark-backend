use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};

use thiserror::Error;

#[derive(Error, Debug)]

pub enum AppError {

    #[error("Database error")]
    DatabaseError,
}

impl IntoResponse for AppError {

    fn into_response(self) -> Response {

        let status = StatusCode::INTERNAL_SERVER_ERROR;

        (status, self.to_string()).into_response()
    }
}