use crate::{config::CONFIG, error::ServiceError};
use argon2::{self, Config};

/// Encode the password with argon2
pub fn hash_password(password: &str) -> Result<String, ServiceError> {
    let config = Config {
        secret: CONFIG.secret_key.as_bytes(),
        ..Default::default()
    };
    argon2::hash_encoded(
        password.as_bytes(),
        CONFIG.password_salt.as_bytes(),
        &config,
    )
    .map_err(|err| {
        dbg!(err);
        ServiceError::InternalServerError
    })
}

/// A function that takes the hash and the introduced password and returns true if the password is OK
pub fn verify(hash: &str, password: &str) -> Result<bool, ServiceError> {
    argon2::verify_encoded_ext(hash, password.as_bytes(), CONFIG.secret_key.as_bytes(), &[])
        .map_err(|err| {
            dbg!(err);
            ServiceError::Unauthorized
        })
}