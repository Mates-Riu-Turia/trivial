use actix_identity::Identity;
use actix_web::{dev::Payload, web, Error, FromRequest, HttpRequest, HttpResponse};
use diesel::prelude::*;
use futures::future::{err, ok, Ready};
use serde::{Deserialize, Serialize};

use crate::error::ServiceError;
use crate::models::{Pool, User, Course};
use crate::util::verify;

#[derive(Debug, Deserialize, Serialize)]
pub struct AuthDataUser {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct AuthDataGuest {
    pub teacher_email: String,
    pub name: String,
    pub course: String,
    pub class: String,
    pub subject: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub enum AuthData {
    User(AuthDataUser),
    Guest(AuthDataGuest),
}
#[derive(Debug, Deserialize, Serialize)]
pub enum AuthToken {
    User(AuthUser),
    Guest(AuthGuest),
}

#[derive(Debug, Deserialize, Serialize)]
pub struct AuthUser {
    pub name: String,
    pub email: String,
    pub gender: String,
    pub expires_at: chrono::NaiveDateTime,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct AuthGuest {
    pub teacher_email: String,
    pub name: String,
    pub course: String,
    pub class: String,
    pub subject: String,
    pub expires_at: chrono::NaiveDateTime,
}


impl FromRequest for AuthToken {
    type Error = Error;
    type Future = Ready<Result<AuthToken, Error>>;

    fn from_request(req: &HttpRequest, pl: &mut Payload) -> Self::Future {
        if let Ok(identity) = Identity::from_request(req, pl).into_inner() {
            if let Some(user_json) = identity.identity() {
                if let Ok(user) = serde_json::from_str::<AuthToken>(&user_json) {
                    let expires_at = match &user {
                        AuthToken::User(auth_user) => auth_user.expires_at,
                        AuthToken::Guest(auth_user) => auth_user.expires_at,
                    };

                    if expires_at > chrono::Local::now().naive_local() {
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
    HttpResponse::Ok().json("")
}

pub async fn login(
    auth_data: web::Json<AuthData>,
    id: Identity,
    pool: web::Data<Pool>,
) -> Result<HttpResponse, actix_web::Error> {
    let user = match auth_data.into_inner() {
        AuthData::User(user) => {
            web::block(move || query_user(user, pool)).await??
        },
        AuthData::Guest(guest) => { 
            web::block(move || query_guest(guest, pool)).await??
        }
    };

    let user_string = serde_json::to_string(&user)?;

    id.remember(user_string);

    Ok(HttpResponse::Ok().finish())
}

pub async fn get_me(logged_user: AuthToken) -> HttpResponse {
    HttpResponse::Ok().json(logged_user)
}

/// Diesel query
fn query_user(auth_data: AuthDataUser, pool: web::Data<Pool>) -> Result<AuthToken, ServiceError> {
    use crate::schema::users::dsl::{email, users};

    let mut conn = pool.get()?;
    let mut items = users
        .filter(email.eq(&auth_data.email))
        .load::<User>(&mut conn)?;

    if let Some(user) = items.pop() {
        if let Ok(matching) = verify(&user.hash, &auth_data.password) {
            if matching {
                return Ok(AuthToken::User(AuthUser{
                    name: user.name,
                    email: user.email,
                    gender: user.gender,
                    expires_at: chrono::Local::now().naive_local() + chrono::Duration::days(1),
                }));
            }
        }
    }
    Err(ServiceError::Unauthorized)
}

fn query_guest(auth_data: AuthDataGuest, pool: web::Data<Pool>) -> Result<AuthToken, ServiceError> {
    use crate::schema::courses::dsl::{courses, id};

    let mut conn = pool.get()?;
    let courses_id = format!("{}-{}", auth_data.course, auth_data.class);
    let mut items = courses
    .filter(id.eq(courses_id))
    .load::<Course>(&mut conn)?;

    if let Some(course) = items.pop() {
        let subject = match auth_data.subject.as_str() {
            "anatomia" => course.anatomia,
            "english" => course.english,
            "biologia" => course.biologia,
            "castellano" => course.castellano,
            "clasica" => course.clasica,
            "dibuix" => course.dibuix,
            "ed_fisica" => course.ed_fisica,
            "filosofia" => course.filosofia,
            "fisica_quimica" => course.fisica_quimica,
            "frances" => course.frances,
            "historia" => course.historia,
            "grec" => course.grec,
            "informatica" => course.informatica,
            "literatura" => course.literatura,
            "llati" => course.llati,
            "mates" => course.mates,
            "musica" => course.musica,
            "orientacio" => course.orientacio,
            "plastica" => course.plastica,
            "religio" => course.religio,
            "tecnologia" => course.tecnologia,
            "valencia" => course.valencia,
            "etica" => course.etica,
            _ => return Err(ServiceError::Unauthorized),
        }; 
        if subject == Some(auth_data.teacher_email.clone()) {
           return Ok(AuthToken::Guest(AuthGuest {
            teacher_email: auth_data.teacher_email,
            name: auth_data.name,
            class: auth_data.class,
            course: auth_data.course,
            subject: auth_data.subject,
            expires_at: chrono::Local::now().naive_local() + chrono::Duration::days(1),
           })); 
        }
    }

    Err(ServiceError::Unauthorized)
}
