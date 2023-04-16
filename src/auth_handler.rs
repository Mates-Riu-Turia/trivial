use actix_identity::Identity;
use actix_web::{dev::Payload, web, Error, FromRequest, HttpRequest, HttpResponse};
use diesel::prelude::*;
use futures::future::{err, ok, Ready};
use serde::{Deserialize, Serialize};

use crate::error::ServiceError;
use crate::models::{Course, Pool, User};
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
    pub role: String,
    pub subjects: Vec<String>,
    pub expires_at: chrono::NaiveDateTime,
    pub password_changed: bool,
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

#[derive(Debug, Deserialize, Serialize)]
pub struct NewPassword {
    pub password: String,
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
        err(ServiceError::Redirect.into())
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
    //let pool_clone = pool.clone();

    let user = match auth_data.into_inner() {
        AuthData::User(user) => web::block(move || query_user(user, pool)).await??,
        AuthData::Guest(guest) => web::block(move || query_guest(guest, pool)).await??,
    };

    let user_string = serde_json::to_string(&user)?;

    id.remember(user_string);

    Ok(HttpResponse::Ok().finish())
}

pub async fn get_me(logged_user: AuthToken) -> HttpResponse {
    HttpResponse::Ok().json(logged_user)
}

pub async fn modify_password(
    logged_user: AuthToken,
    password: web::Json<NewPassword>,
    pool: web::Data<Pool>,
) -> Result<HttpResponse, actix_web::Error> {
    if let AuthToken::User(user) = logged_user {
        web::block(move || query_modify_password(user, password.into_inner(), pool)).await??;
        return Ok(HttpResponse::Ok().json(""));
    }
    Err(ServiceError::Unauthorized.into())
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
                let mut subjects= Vec::new();
                if user.role == *"T" {
                    subjects = query_teacher_subject(user.email.clone(), pool)?;
                }
                return Ok(AuthToken::User(AuthUser {
                    name: user.name,
                    email: user.email,
                    gender: user.gender,
                    role: user.role,
                    subjects,
                    expires_at: chrono::Local::now().naive_local() + chrono::Duration::days(1),
                    password_changed: user.password_changed,
                }));
            }
        }
    }
    Err(ServiceError::Unauthorized)
}

fn query_teacher_subject(email: String, pool: web::Data<Pool>) -> Result<Vec<String>, ServiceError> {
    use crate::schema::courses::dsl::*;

    let mut subjects = Vec::new();
    let mut conn = pool.get()?;

    let items = courses.filter(anatomia.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("anatomia".to_string());
    }

    let items = courses.filter(english.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("english".to_string());
    }

    let items = courses.filter(biologia.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("biologia".to_string());
    }

    let items = courses.filter(castellano.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("castellano".to_string());
    }

    let items = courses.filter(clasica.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("clasica".to_string());
    }

    let items = courses.filter(dibuix.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("dibuix".to_string());
    }

    let items = courses.filter(ed_fisica.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("ed_fisica".to_string());
    }

    let items = courses.filter(filosofia.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("filosofia".to_string());
    }

    let items = courses.filter(fisica_quimica.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("fisica_quimica".to_string());
    }

    let items = courses.filter(frances.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("frances".to_string());
    }

    let items = courses.filter(historia.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("historia".to_string());
    }

    let items = courses.filter(grec.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("grec".to_string());
    }

    let items = courses.filter(informatica.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("informatica".to_string());
    }

    let items = courses.filter(literatura.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("literatura".to_string());
    }

    let items = courses.filter(llati.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("llati".to_string());
    }

    let items = courses.filter(mates.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("mates".to_string());
    }

    let items = courses.filter(musica.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("musica".to_string());
    }

    let items = courses.filter(orientacio.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("orientacio".to_string());
    }

    let items = courses.filter(plastica.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("plastica".to_string());
    }

    let items = courses.filter(religio.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("religio".to_string());
    }

    let items = courses.filter(tecnologia.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("tecnologia".to_string());
    }

    let items = courses.filter(valencia.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("valencia".to_string());
    }

    let items = courses.filter(etica.eq(&email)).load::<Course>(&mut conn)?;
    if !items.is_empty() {
        subjects.push("etica".to_string());
    }

    Ok(subjects)

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

fn query_modify_password(
    auth_data: AuthUser,
    password: NewPassword,
    pool: web::Data<Pool>,
) -> Result<(), ServiceError> {
    use crate::schema::users::dsl::{email, hash, password_changed, users};

    let mut conn = pool.get()?;

    diesel::update(users.filter(email.eq(auth_data.email)))
        .set((
            hash.eq(crate::util::hash_password(&password.password)?),
            password_changed.eq(true),
        ))
        .execute(&mut conn)?;

    Ok(())
}
