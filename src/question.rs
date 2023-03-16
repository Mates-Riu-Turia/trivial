use crate::{
    auth_handler::AuthToken,
    error::ServiceError,
    models::{Pool, Question, StudentQuestion},
};
use actix_web::{web, HttpResponse};
use diesel::{insert_into, prelude::*};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub enum QuestionData {
    Teacher(TeacherQuestionData),
    Guest(StudentQuestionData),
}

#[derive(Debug, Deserialize, Serialize)]
pub struct TeacherQuestionData {
    pub subject: String,
    pub level: i32,
    pub question: String,
    pub hide: i32,
    pub answers: String,
    pub tries: i32,
    pub time: i32,
    pub image: String,
    pub verified: bool,
}

impl TeacherQuestionData {
    pub fn to_question_model(self, creator: String) -> Question {
        Question::from(
            self.subject,
            self.level,
            self.question,
            self.hide,
            self.answers,
            self.tries,
            self.time,
            self.image,
            self.verified,
            creator,
        )
    }
}

#[derive(Debug, Deserialize, Serialize)]
pub struct StudentQuestionData {
    pub subject: String,
    pub level: i32,
    pub question: String,
    pub answers: String,
    pub tries: i32,
    pub time: i32,
    pub image: String,
}

impl StudentQuestionData {
    pub fn to_question_model(self, course_creator: String, name_creator: String) -> StudentQuestion {
        StudentQuestion::from(
            course_creator,
            name_creator,
            self.subject,
            self.level,
            self.question,
            self.answers,
            self.tries,
            self.time,
            self.image,
        )
    }
}

pub async fn new_question(
    auth_data: AuthToken,
    question: web::Json<QuestionData>,
    pool: web::Data<Pool>,
) -> Result<HttpResponse, actix_web::Error> {
    let question = question.into_inner();
    match auth_data {
        AuthToken::User(auth_data) => {
            if let QuestionData::Teacher(question) = question {
                if question.verified && auth_data.role == "T".to_string() {
                    return Err(ServiceError::BadRequest(
                        "A teacher that isn't an admin cannot verify a question".to_string(),
                    )
                    .into());
                }
                let question = question.to_question_model(auth_data.email);
                web::block(move || new_question_query(question, pool)).await??;
            }
            else {
                return Err(ServiceError::BadRequest("Unexpected question format".to_string()).into());
            }
        }
        AuthToken::Guest(auth_data) => {
            if let QuestionData::Guest(question) = question {
                let question = question.to_question_model(format!("{}-{}", auth_data.course, auth_data.class), auth_data.name);
                web::block(move || new_student_question_query(question, pool)).await??;
            }
            else {
                return Err(ServiceError::BadRequest("Unexpected question format".to_string()).into());
            }
        }
    };
    Ok(HttpResponse::Ok().finish())
}

fn new_question_query(question: Question, pool: web::Data<Pool>) -> Result<(), ServiceError> {
    use crate::schema::questions::dsl::questions;

    let mut conn = pool.get()?;

    return match insert_into(questions).values(&question).execute(&mut conn) {
        Ok(_) => Ok(()),
        Err(_) => Err(ServiceError::InternalServerError),
    };
}

fn new_student_question_query(
    question: StudentQuestion,
    pool: web::Data<Pool>,
) -> Result<(), ServiceError> {
    use crate::schema::students_questions::dsl::students_questions;

    let mut conn = pool.get()?;

    return match insert_into(students_questions)
        .values(&question)
        .execute(&mut conn)
    {
        Ok(_) => Ok(()),
        Err(_) => Err(ServiceError::InternalServerError),
    };
}
