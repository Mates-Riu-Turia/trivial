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
    pub subject: String,
    pub level: i32,
    pub question: String,
    pub hide: i32,
    pub answers: String,
    pub tries: i32,
    pub time: i32,
    pub image: String,
    pub created_at: chrono::NaiveDateTime,
    pub verified: bool,
    pub modified: bool,
}

impl Question {
    pub fn from<S: Into<i32>, T: Into<String>>(
        subject: T,
        level: S,
        question: T,
        hide: S,
        answers: T,
        tries: S,
        time: S,
        image: T,
        verified: bool,
    ) -> Self {
        Self {
            subject: subject.into(),
            level: level.into(),
            question: question.into(),
            hide: hide.into(),
            answers: answers.into(),
            tries: tries.into(),
            time: time.into(),
            image: image.into(),
            created_at: chrono::Local::now().naive_local(),
            verified,
            modified: false,
        }
    }
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