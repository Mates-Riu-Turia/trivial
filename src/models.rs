use crate::schema::*;
use diesel::{prelude::*, r2d2::ConnectionManager, MysqlConnection};
use serde::{Deserialize, Serialize};

// type alias to use in multiple places
pub type Pool = r2d2::Pool<ConnectionManager<MysqlConnection>>;

pub enum Gender {
    Boy,
    Girl,
}

impl Gender {
    pub fn into_str(&self) -> String {
        return match self {
            Self::Boy => { String::from("B") },
            Self::Girl => { String::from("G") },
        };
    }
}

pub enum Role {
    Admin,
    Teacher,
}

impl Role {
    pub fn into_str(&self) -> String {
        return match self {
            Self::Admin => { String::from("A") },
            Self::Teacher => { String::from("T") },
        };
    }
}

#[derive(Debug, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = users)]
pub struct User {
    pub name: String,
    pub email: String,
    pub hash: String,
    pub created_at: chrono::NaiveDateTime,
    pub gender: String,
    pub role: String,

}

impl User {
    pub fn from<S: Into<String>, T: Into<String>>(name: S, email: S, pwd: T, gender: Gender, role: Role) -> Self {
        Self {
            name: name.into(),
            email: email.into(),
            hash: pwd.into(),
            created_at: chrono::Local::now().naive_local(),
            gender: gender.into_str(),
            role: role.into_str()    
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
        id: S,
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
