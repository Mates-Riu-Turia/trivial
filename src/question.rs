use crate::{
    auth_handler::AuthToken,
    error::ServiceError,
    models::{Pool, Question, StudentQuestion},
};
use actix_web::{web, HttpResponse};
use diesel::{insert_into, prelude::*};
use serde::{Deserialize, Serialize};

/// This enum holds the question sended by the client, the question can be from a teacher or from a guest
#[derive(Debug, Deserialize, Serialize)]
pub enum QuestionData {
    /// The teacher variant
    Teacher(TeacherQuestionData),
    /// The guest variant
    Guest(StudentQuestionData),
}

/// A struct with the question created by the teacher
#[derive(Debug, Deserialize, Serialize)]
pub struct TeacherQuestionData {
    /// The subject of the question
    pub subject: String,
    /// The level of the question
    pub level: i32,
    /// The question body
    pub question: String,
    /// If true, doesn't show the correct answer if you failed the question
    pub hide: bool,
    /// A list with the possible answers
    pub answers: String,
    /// The number of tries for a question, range between 1 and 3
    pub tries: i32,
    /// The amount of time for ansering, 30 seconds to 150 seconds
    pub time: i32,
    /// The path of the associated image, it is returned by api/image
    pub image: String,
    /// If true, shows the image much bigger
    pub bigger: bool,
    /// Is the question ready for the Trivial? Only can be changed to true if you are an admin
    pub verified: bool,
}

impl TeacherQuestionData {
    /// Converts the TeacherQuestionData to the Diesel Table format
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
            creator,
        }
    }
}

/// A struct with the question created by the guest/student
#[derive(Debug, Deserialize, Serialize)]
pub struct StudentQuestionData {
    /// The level of the question
    pub level: i32,
    /// The question body
    pub question: String,
    /// A list with the possible answers
    pub answers: String,
    /// The number of tries for a question, range between 1 and 3
    pub tries: i32,
    /// The amount of time for ansering, 30 seconds to 150 seconds
    pub time: i32,
}

impl StudentQuestionData {
    /// Converts the StudentQuestionData to the Diesel Table format
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

/// This struct is sended by the client, is used for filtering questions
#[derive(Debug, Deserialize, Serialize)]
pub struct FilterUser {
    /// The question id, if it's equal to 0 it will be skiped
    pub id: i32,
    /// The subject of the question
    pub subject: String,
    /// The level of the question
    pub level: i32,
    /// The start date for search
    pub start_date: chrono::NaiveDateTime,
    /// The end date for search
    pub end_date: chrono::NaiveDateTime,
    /// The creator,  1 -> All the users, 2 -> Only me, 3 -> All except me, if you are normal user only 2 is valid
    pub creator: i32,
    /// If the question is verified or not
    pub verified: bool,
}

/// The same as FilterUser but for the guests questions
#[derive(Debug, Deserialize, Serialize)]
pub struct FilterGuest {
    /// The question id, if it's equal to 0 it will be skiped
    pub id: i32,
    /// The subject of the question
    pub subject: String,
    /// The course of the guest
    pub course: String,
}

/// An enum that joins FilterUser and FilterGuest
#[derive(Debug, Deserialize, Serialize)]
pub enum Filter {
    /// The variant for users questions
    User(FilterUser),
    /// The variant for guests questions
    Guest(FilterGuest),
}

/// An struct for deleting a question
#[derive(Debug, Deserialize, Serialize)]
pub struct DeleteQuestions {
    /// The id of the question
    pub id: i32,
    /// If the question is from the user or from the guest
    pub is_guest: bool,
}

/// Creates a new question
pub async fn new_question(
    auth_data: AuthToken,
    question: web::Json<QuestionData>,
    pool: web::Data<Pool>,
) -> Result<HttpResponse, actix_web::Error> {
    let question = question.into_inner();
    let mut id = 0;
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
                id = web::block(move || new_question_query(question, pool)).await??;
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
    Ok(HttpResponse::Ok().json(id))
}

/// Filter the questions
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

/// Delete a question
pub async fn delete_question(
    auth_data: AuthToken,
    question: web::Json<DeleteQuestions>,
    pool: web::Data<Pool>,
) -> Result<HttpResponse, actix_web::Error> {
    let question = question.into_inner();
    if let AuthToken::User(user) = auth_data {
        if !question.is_guest {
            web::block(move || delete_question_query(question.id, user.role, user.email, pool))
                .await??;
        } else {
            web::block(move || delete_student_question_query(question.id, pool)).await??;
        }

        return Ok(HttpResponse::Ok().finish());
    }
    Err(ServiceError::Unauthorized.into())
}

/// Mark a question as verified
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

fn new_question_query(question_data: Question, pool: web::Data<Pool>) -> Result<i32, ServiceError> {
    use crate::schema::questions::dsl::*;

    let mut conn = pool.get()?;

    match insert_into(questions)
        .values(&question_data)
        .execute(&mut conn)
    {
        Ok(_) => Ok(questions.order(id.desc()).first::<Question>(&mut conn)?.id),
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

    if filter.id != 0 {
        let data = students_questions
            .filter(id.eq(filter.id))
            .load::<StudentQuestion>(&mut conn)?;

        return Ok(data);
    }

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

fn delete_student_question_query(
    question_id: i32,
    pool: web::Data<Pool>,
) -> Result<(), ServiceError> {
    use crate::schema::students_questions::dsl::*;

    let mut conn = pool.get()?;

    match diesel::delete(students_questions.filter(id.eq(question_id))).execute(&mut conn) {
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
