use std::collections::HashSet;

use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

pub const TOKEN_AUDIENCE: &str = "bookmark-api";
pub const TOKEN_ISSUER: &str = "bookmark-api";

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
    pub iat: usize,
    pub aud: String,
    pub iss: String,
}

pub fn create_token(user_id: &str, secret: &str) -> Result<String, jsonwebtoken::errors::Error> {
    let now = Utc::now();
    let expiration = now
        .checked_add_signed(Duration::days(7))
        .expect("valid timestamp");

    let claims = Claims {
        sub: user_id.to_string(),
        iat: now.timestamp() as usize,
        exp: expiration.timestamp() as usize,
        aud: TOKEN_AUDIENCE.to_string(),
        iss: TOKEN_ISSUER.to_string(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
}

pub fn verify_token(token: &str, secret: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let mut validation = Validation::default();
    validation.aud = Some(HashSet::from([TOKEN_AUDIENCE.to_string()]));
    validation.iss = Some(HashSet::from([TOKEN_ISSUER.to_string()]));
    validation.set_required_spec_claims(&["exp", "iat", "aud", "iss"]);

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &validation,
    )?;

    Ok(token_data.claims)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn token_round_trip() {
        let secret = "test-secret-that-is-long-enough-for-testing";

        let token = create_token("507f1f77bcf86cd799439011", secret).unwrap();

        let claims = verify_token(&token, secret).unwrap();
        assert_eq!(claims.sub, "507f1f77bcf86cd799439011");
        assert_eq!(claims.aud, TOKEN_AUDIENCE);
        assert_eq!(claims.iss, TOKEN_ISSUER);
    }

    #[test]
    fn rejects_token_from_wrong_secret() {
        let token = create_token("507f1f77bcf86cd799439011", "secret-one").unwrap();
        assert!(verify_token(&token, "secret-two").is_err());
    }

    #[test]
    fn rejects_tampered_token() {
        let token = create_token("507f1f77bcf86cd799439011", "secret").unwrap();
        let mut chars: Vec<char> = token.chars().collect();
        let len = chars.len();
        chars[len - 2] = if chars[len - 2] == 'a' { 'b' } else { 'a' };
        let tampered: String = chars.into_iter().collect();
        assert!(verify_token(&tampered, "secret").is_err());
    }
}
