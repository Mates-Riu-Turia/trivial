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
}

pub async fn register_user(
    user_data: web::Json<UserData>,
    pool: web::Data<Pool>,
) -> Result<HttpResponse, actix_web::Error> {
    let user = web::block(move || query(user_data.into_inner(), pool)).await??;

    Ok(HttpResponse::Ok().json(&user))
}

fn query(user_data: UserData, pool: web::Data<Pool>) -> Result<(), crate::error::ServiceError> {
    use crate::schema::users::dsl::users;

    let mut conn = pool.get()?;
    let password: String = hash_password(&user_data.password)?;
    let user = User::from(&user_data.name, &user_data.email, password);
    diesel::insert_into(users).values(&user).execute(&mut conn);
    Ok(())
}
