use crate::schema::*;
use diesel::{prelude::*, r2d2::ConnectionManager, MysqlConnection};
use serde::{Deserialize, Serialize};

// type alias to use in multiple places
pub type Pool = r2d2::Pool<ConnectionManager<MysqlConnection>>;

#[derive(Debug, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = users)]
pub struct User {
    pub name: String,
    pub email: String,
    pub hash: String,
    pub created_at: chrono::NaiveDateTime,
    pub gender: String,
    pub role: String,
    pub password_changed: bool,
}

impl User {
    pub fn from<S: Into<String>>(name: S, email: S, pwd: S, gender: S, role: S) -> Self {
        Self {
            name: name.into(),
            email: email.into(),
            hash: pwd.into(),
            created_at: chrono::Local::now().naive_local(),
            gender: gender.into(),
            role: role.into(),
            password_changed: false,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = questions)]
pub struct Question {
    pub id: i32,
    pub subject: String,
    pub level: i32,
    pub question: String,
    pub hide: bool,
    pub answers: String,
    pub tries: i32,
    pub time: i32,
    pub image: String,
    pub bigger: bool,
    pub created_at: chrono::NaiveDateTime,
    pub verified: bool,
    pub modified: bool,
    pub creator: String,
}

#[derive(Debug, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = students_questions)]
pub struct StudentQuestion {
    pub id: i32,
    pub course_creator: String,
    pub name_creator: String,
    pub subject: String,
    pub level: i32,
    pub question: String,
    pub answers: String,
    pub tries: i32,
    pub time: i32,
    pub created_at: chrono::NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = courses)]
pub struct Course {
    pub id: String,
    pub anatomia: Option<String>,
    pub english: Option<String>,
    pub biologia: Option<String>,
    pub castellano: Option<String>,
    pub clasica: Option<String>,
    pub dibuix: Option<String>,
    pub ed_fisica: Option<String>,
    pub filosofia: Option<String>,
    pub fisica_quimica: Option<String>,
    pub frances: Option<String>,
    pub historia: Option<String>,
    pub grec: Option<String>,
    pub informatica: Option<String>,
    pub literatura: Option<String>,
    pub llati: Option<String>,
    pub mates: Option<String>,
    pub musica: Option<String>,
    pub orientacio: Option<String>,
    pub plastica: Option<String>,
    pub religio: Option<String>,
    pub tecnologia: Option<String>,
    pub valencia: Option<String>,
    pub etica: Option<String>,
}
