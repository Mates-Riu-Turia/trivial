use actix_multipart::{
    form::{
        tempfile::TempFile,
        MultipartForm,
    },
};
use actix_web::{Error, HttpResponse, Responder};
use crate::{auth_handler::AuthToken, error::ServiceError};

#[derive(Debug, MultipartForm)]
pub struct UploadForm {
    file: TempFile,
}

pub async fn save_file(
    MultipartForm(form): MultipartForm<UploadForm>, logged_user: AuthToken
) -> Result<impl Responder, Error> {
    if let AuthToken::Guest(_) = logged_user {
        return Err(ServiceError::Unauthorized.into());
    }
    else {
        if form.file.size > 1000000 {
            return Err(ServiceError::BadRequest("The file weights a lot".to_string()).into())
        }
        let path = format!("./images/{}", chrono::Local::now().naive_local().to_string());
        return match form.file.file.persist(&path) {
            Ok(_) =>     Ok(HttpResponse::Ok().body(path)),
            Err(_) => Err(ServiceError::InternalServerError.into())
        }
    }
}