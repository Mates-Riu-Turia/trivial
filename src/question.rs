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
    pub hide: bool,
    pub answers: String,
    pub tries: i32,
    pub time: i32,
    pub image: String,
    pub bigger: bool,
    pub verified: bool,
}

impl TeacherQuestionData {
    pub fn to_question_model(self, creator: String) -> Question {
        Question {
            id: 0,
            subject: self.subject,
            level: self.level,
            question: self.question,
            hide: self.hide,
            answers: self.answers,
            tries: self.tries,
            time: self.time,
            image: self.image,
            bigger: self.bigger,
            created_at: chrono::Local::now().naive_local(),
            verified: self.verified,
            modified: false,
            creator,
        }
    }
}

#[derive(Debug, Deserialize, Serialize)]
pub struct StudentQuestionData {
    pub level: i32,
    pub question: String,
    pub answers: String,
    pub tries: i32,
    pub time: i32,
}

impl StudentQuestionData {
    pub fn to_question_model(
        self,
        course_creator: String,
        name_creator: String,
        subject: String,
    ) -> StudentQuestion {
        StudentQuestion {
            id: 0,
            course_creator,
            name_creator,
            subject,
            level: self.level,
            question: self.question,
            answers: self.answers,
            tries: self.tries,
            time: self.time,
            created_at: chrono::Local::now().naive_local(),
        }
    }
}

#[derive(Debug, Deserialize, Serialize)]
pub struct FilterUser {
    pub id: i32,
    pub subject: String,
    pub level: i32,
    pub start_date: chrono::NaiveDateTime,
    pub end_date: chrono::NaiveDateTime,
    pub creator: i32,
    pub verified: bool,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct FilterGuest {
    pub subject: String,
    pub course: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub enum Filter {
    User(FilterUser),
    Guest(FilterGuest),
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
                if question.verified && auth_data.role == *"T" {
                    return Err(ServiceError::BadRequest(
                        "A teacher that isn't an admin cannot verify a question".to_string(),
                    )
                    .into());
                }
                let question = question.to_question_model(auth_data.email);
                web::block(move || new_question_query(question, pool)).await??;
            } else {
                return Err(
                    ServiceError::BadRequest("Unexpected question format".to_string()).into(),
                );
            }
        }
        AuthToken::Guest(auth_data) => {
            if let QuestionData::Guest(question) = question {
                let question = question.to_question_model(
                    format!("{}-{}", auth_data.course, auth_data.class),
                    auth_data.name,
                    auth_data.subject,
                );
                web::block(move || new_student_question_query(question, pool)).await??;
            } else {
                return Err(
                    ServiceError::BadRequest("Unexpected question format".to_string()).into(),
                );
            }
        }
    };
    Ok(HttpResponse::Ok().finish())
}

pub async fn get_questions(
    auth_data: AuthToken,
    filter: web::Json<Filter>,
    pool: web::Data<Pool>,
) -> Result<HttpResponse, actix_web::Error> {
    if let AuthToken::User(user) = auth_data {
        match filter.into_inner() {
            Filter::User(filter) => {
                let data =
                    web::block(move || filter_question_query(filter, user.email, pool)).await??;
                return Ok(HttpResponse::Ok().json(data));
            }
            Filter::Guest(filter) => {
                let data =
                    web::block(move || filter_student_question_query(filter, pool)).await??;
                return Ok(HttpResponse::Ok().json(data));
            }
        }
    }
    Err(ServiceError::Unauthorized.into())
}

pub async fn delete_question(
    auth_data: AuthToken,
    question: web::Json<i32>,
    pool: web::Data<Pool>,
) -> Result<HttpResponse, actix_web::Error> {
    if let AuthToken::User(user) = auth_data {
        web::block(move || {
            delete_question_query(question.into_inner(), user.role, user.email, pool)
        })
        .await??;
        return Ok(HttpResponse::Ok().finish());
    }
    Err(ServiceError::Unauthorized.into())
}

pub async fn verify_question(
    auth_data: AuthToken,
    question: web::Json<i32>,
    pool: web::Data<Pool>,
) -> Result<HttpResponse, actix_web::Error> {
    if let AuthToken::User(user) = auth_data {
        if user.role == "A" {
            web::block(move || verify_question_query(question.into_inner(), pool)).await??;
            return Ok(HttpResponse::Ok().finish());
        }
        return Err(ServiceError::Unauthorized.into());
    }
    Err(ServiceError::Unauthorized.into())
}

fn new_question_query(question: Question, pool: web::Data<Pool>) -> Result<(), ServiceError> {
    use crate::schema::questions::dsl::questions;

    let mut conn = pool.get()?;

    match insert_into(questions).values(&question).execute(&mut conn) {
        Ok(_) => Ok(()),
        Err(_) => Err(ServiceError::InternalServerError),
    }
}

fn new_student_question_query(
    question: StudentQuestion,
    pool: web::Data<Pool>,
) -> Result<(), ServiceError> {
    use crate::schema::students_questions::dsl::students_questions;

    let mut conn = pool.get()?;

    match insert_into(students_questions)
        .values(&question)
        .execute(&mut conn)
    {
        Ok(_) => Ok(()),
        Err(_) => Err(ServiceError::InternalServerError),
    }
}

fn filter_question_query(
    filter: FilterUser,
    filter_user: String,
    pool: web::Data<Pool>,
) -> Result<Vec<Question>, ServiceError> {
    let mut conn = pool.get()?;

    use crate::schema::questions::dsl::*;

    if filter.id != 0 {
        return Ok(questions
            .filter(id.eq(filter.id))
            .load::<Question>(&mut conn)?);
    }

    let data = questions
        .filter(subject.eq(filter.subject))
        .filter(level.eq(filter.level))
        .filter(created_at.ge(filter.start_date))
        .filter(created_at.le(filter.end_date));

    let vec;

    if !filter.verified {
        if filter.creator == 1 {
            vec = data
                .filter(verified.eq(false))
                .load::<Question>(&mut conn)?;
        } else if filter.creator == 2 {
            vec = data
                .filter(creator.eq(filter_user))
                .filter(verified.eq(false))
                .load::<Question>(&mut conn)?;
        } else {
            vec = data
                .filter(creator.ne(filter_user))
                .filter(verified.eq(false))
                .load::<Question>(&mut conn)?;
        }
    } else if filter.creator == 1 {
        vec = data.load::<Question>(&mut conn)?;
    } else if filter.creator == 2 {
        vec = data
            .filter(creator.eq(filter_user))
            .load::<Question>(&mut conn)?;
    } else {
        vec = data
            .filter(creator.ne(filter_user))
            .load::<Question>(&mut conn)?;
    }

    Ok(vec)
}

fn filter_student_question_query(
    filter: FilterGuest,
    pool: web::Data<Pool>,
) -> Result<Vec<StudentQuestion>, ServiceError> {
    let mut conn = pool.get()?;

    use crate::schema::students_questions::dsl::*;

    let data = students_questions
        .filter(subject.eq(filter.subject))
        .filter(course_creator.eq(filter.course))
        .load::<StudentQuestion>(&mut conn)?;

    Ok(data)
}

fn delete_question_query(
    question_id: i32,
    role: String,
    email: String,
    pool: web::Data<Pool>,
) -> Result<(), ServiceError> {
    use crate::schema::questions::dsl::*;

    let mut conn = pool.get()?;

    if role == *"T"
        && questions
            .filter(id.eq(question_id))
            .filter(creator.eq(email))
            .load::<Question>(&mut conn)?
            .is_empty()
    {
        return Err(ServiceError::Unauthorized);
    }

    match diesel::delete(questions.filter(id.eq(question_id))).execute(&mut conn) {
        Ok(_) => Ok(()),
        Err(_) => Err(ServiceError::InternalServerError),
    }
}

fn verify_question_query(question_id: i32, pool: web::Data<Pool>) -> Result<(), ServiceError> {
    use crate::schema::questions::dsl::*;

    let mut conn = pool.get()?;

    match diesel::update(questions.find(question_id))
        .set(verified.eq(true))
        .execute(&mut conn)
    {
        Ok(_) => Ok(()),
        Err(_) => Err(ServiceError::InternalServerError),
    }
}
