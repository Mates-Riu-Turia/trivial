use actix_files::NamedFile;
use actix_identity::{CookieIdentityPolicy, IdentityService};
use actix_web::Result;
use actix_web::{get, middleware, web, App, HttpServer};
use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};
use std::path::PathBuf;
use trivial_packager::{auth_handler, config::Config, models, register_handler};

#[get("/favicon.ico")]
async fn publish_favicon() -> Result<NamedFile> {
    let path = PathBuf::from("static/images/favicon.ico");
    Ok(NamedFile::open(path)?)
}

#[get("/")]
async fn publish_index(_logged_user: auth_handler::AuthToken) -> Result<NamedFile> {
    let path = PathBuf::from("static/index.html");
    Ok(NamedFile::open(path)?)
}

#[get("/login")]
async fn publish_login_html() -> Result<NamedFile> {
    let path = PathBuf::from("static/login.html");
    Ok(NamedFile::open(path)?)
}

#[get("/static/js/color-modes.js")]
async fn publish_color_modes_js() -> Result<NamedFile> {
    let path = PathBuf::from("static/js/color-modes.js");
    Ok(NamedFile::open(path)?)
}

#[get("/static/css/sign-in.css")]
async fn publish_sign_in_css() -> Result<NamedFile> {
    let path = PathBuf::from("static/css/sign-in.css");
    Ok(NamedFile::open(path)?)
}

#[get("/static/js/sign-in.js")]
async fn publish_sign_in_js() -> Result<NamedFile> {
    let path = PathBuf::from("static/js/sign-in.js");
    Ok(NamedFile::open(path)?)
}

#[get("/static/css/index.css")]
async fn publish_index_css() -> Result<NamedFile> {
    let path = PathBuf::from("static/css/index.css");
    Ok(NamedFile::open(path)?)
}

#[get("/static/js/sign-off.js")]
async fn publish_sign_off_js() -> Result<NamedFile> {
    let path = PathBuf::from("static/js/sign-off.js");
    Ok(NamedFile::open(path)?)
}


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let config = Config::new("./config.json");
    let config_copy = Config::new("./config.json");

    dotenv::dotenv().ok();
    std::env::set_var(
        "RUST_LOG",
        "simple-auth-server=debug,actix_web=info,actix_server=info",
    );
    env_logger::init();

    // create db connection pool
    let manager = ConnectionManager::<MysqlConnection>::new(config.db_url);
    let pool: models::Pool = r2d2::Pool::builder()
        .build(manager)
        .expect("Failed to create pool.");

    // Start http server
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
            // enable logger
            .wrap(middleware::Logger::default())
            .wrap(IdentityService::new(
                CookieIdentityPolicy::new(&config.cookie_key)
                    .name("auth")
                    .path("/")
                    .domain(config.domain.clone())
                    .max_age(time::Duration::days(1))
                    .secure(false), // this can only be true if you have https
            ))
            // limit the maximum amount of data that server will accept
            .app_data(web::JsonConfig::default().limit(4096))
            // everything under '/api/' route
            .service(
                web::scope("/api")
                    .service(
                        web::resource("/add_user")
                            .route(web::post().to(register_handler::register_user)),
                    )
                    .service(
                        web::resource("/auth")
                            .route(web::post().to(auth_handler::login))
                            .route(web::delete().to(auth_handler::logout))
                            .route(web::get().to(auth_handler::get_me)),
                    ),
            )
            .service(publish_favicon)
            .service(publish_index)
            .service(publish_login_html)
            .service(publish_color_modes_js)
            .service(publish_sign_in_css)
            .service(publish_sign_in_js)
            .service(publish_index_css)
            .service(publish_sign_off_js)
    })
    .bind(format!("{}:{}", config_copy.domain, config_copy.port))?
    .run()
    .await
}
