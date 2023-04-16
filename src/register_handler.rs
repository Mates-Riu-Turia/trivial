// register_handler.rs
use actix_web::{web, HttpResponse};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::{Pool, User};
use crate::util::hash_password;
// UserData is used to extract data from a post request by the client
#[derive(Debug, Deserialize, Serialize)]
pub struct UserData {
    pub name: String,
    pub email: String,
    pub password: String,
    pub gender: String,
    pub role: String,
}

pub async fn register_user(
    user_data: web::Json<UserData>,
    pool: web::Data<Pool>,
) -> Result<HttpResponse, actix_web::Error> {
    let user_data = user_data.into_inner();

    if !(user_data.gender == *"B" || user_data.gender == *"G") {
        return Err(actix_web::error::ErrorBadRequest("Missing gender"));
    } else if !(user_data.role == *"A" || user_data.role == *"T") {
        return Err(actix_web::error::ErrorBadRequest("Missing role"));
    }

    web::block(move || query(user_data, pool)).await??;

    Ok(HttpResponse::Ok().finish())
}

fn query(user_data: UserData, pool: web::Data<Pool>) -> Result<(), crate::error::ServiceError> {
    use crate::schema::users::dsl::users;

    let mut conn = pool.get()?;
    let password: String = hash_password(&user_data.password)?;
    let user = User::from(
        &user_data.name,
        &user_data.email,
        &password,
        &user_data.gender,
        &user_data.role,
    );
    match diesel::insert_into(users).values(&user).execute(&mut conn) {
        Ok(_) => Ok(()),
        Err(_) => Err(crate::error::ServiceError::InternalServerError),
    }
}
