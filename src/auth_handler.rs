use actix_identity::Identity;
use actix_web::{dev::Payload, web, Error, FromRequest, HttpRequest, HttpResponse};
use diesel::prelude::*;
use futures::future::{err, ok, Ready};
use serde::{Deserialize, Serialize};

use crate::error::ServiceError;
use crate::models::{Pool, User};
use crate::util::verify;

#[derive(Debug, Deserialize, Serialize)]
pub struct AuthData {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct AuthUser {
    pub name: String,
    pub email: String,
    pub expires_at: chrono::NaiveDateTime,
}

impl FromRequest for AuthUser {
    type Error = Error;
    type Future = Ready<Result<AuthUser, Error>>;

    fn from_request(req: &HttpRequest, pl: &mut Payload) -> Self::Future {
        if let Ok(identity) = Identity::from_request(req, pl).into_inner() {
            if let Some(user_json) = identity.identity() {
                if let Ok(user) = serde_json::from_str::<AuthUser>(&user_json) {
                    if user.expires_at > chrono::Local::now().naive_local() {
                        return ok(user);
                    }
                }
            }
        }
        err(ServiceError::Unauthorized.into())
    }
}

pub async fn logout(id: Identity) -> HttpResponse {
    id.forget();
    HttpResponse::Ok().finish()
}

pub async fn login(
    auth_data: web::Json<AuthData>,
    id: Identity,
    pool: web::Data<Pool>,
) -> Result<HttpResponse, actix_web::Error> {
    let user = web::block(move || query(auth_data.into_inner(), pool)).await??;

    let user_string = serde_json::to_string(&user)?;
    id.remember(user_string);

    Ok(HttpResponse::Ok().finish())
}

pub async fn get_me(logged_user: AuthUser) -> HttpResponse {
    HttpResponse::Ok().json(logged_user)
}

/// Diesel query
fn query(auth_data: AuthData, pool: web::Data<Pool>) -> Result<AuthUser, ServiceError> {
    use crate::schema::users::dsl::{email, users};
    let mut conn = pool.get()?;
    let mut items = users
        .filter(email.eq(&auth_data.email))
        .load::<User>(&mut conn)?;

    if let Some(user) = items.pop() {
        if let Ok(matching) = verify(&user.hash, &auth_data.password) {
            if matching {
                return Ok(AuthUser {
                    name: user.name,
                    email: user.email,
                    expires_at: chrono::Local::now().naive_local() + chrono::Duration::days(1),
                });
            }
        }
    }
    Err(ServiceError::Unauthorized)
}
