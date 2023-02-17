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
}

impl User {
    pub fn from<S: Into<String>, T: Into<String>>(name: S, email: S, pwd: T) -> Self {
        Self {
            name: name.into(),
            email: email.into(),
            hash: pwd.into(),
            created_at: chrono::Local::now().naive_local(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = preguntas)]
pub struct Question {
    pub codi_pregunta: i32,
    pub assignatura: String,
    pub nivell: i32,
    pub text: String,
    pub no_mostrar: i32,
    pub respostes: String,
    pub intents: i32,
    pub temps: i32,
    pub imatge: String,
    pub data: chrono::NaiveDateTime,
    pub verificada: i32,
    pub modificada: i32,
}

impl Question {
    pub fn from<S: Into<i32>, T: Into<String>>(
        id: S,
        subject: T,
        level: S,
        text: T,
        not_show: S,
        answer: T,
        attempts: S,
        time: S,
        image: T,
        verified: S,
    ) -> Self {
        Self {
            codi_pregunta: id.into(),
            assignatura: subject.into(),
            nivell: level.into(),
            text: text.into(),
            no_mostrar: not_show.into(),
            respostes: answer.into(),
            intents: attempts.into(),
            temps: time.into(),
            imatge: image.into(),
            data: chrono::Local::now().naive_local(),
            verificada: verified.into(),
            modificada: 0,
        }
    }
}
