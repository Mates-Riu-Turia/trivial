use lazy_static::lazy_static;
use serde::Deserialize;
use serde_big_array::BigArray;
use std::{fs::File, io::Read, path::Path};

lazy_static! {
    /// A wrapper for reading the configuration parameters everywhere in the code
    pub static ref CONFIG: Config = Config::new("config.json");
}

/// The struct with the configuration parameters
#[derive(Deserialize)]
pub struct Config {
    /// The domain of the Trivial e.g.: localhost
    pub domain: String,
    /// The port of the Trivial e.g.: 8080
    pub port: u16,
    /// The MySql url e.g.: mysql://user:password@domain/db
    pub db_url: String,
    /// The key for signing the auth cookie
    #[serde(with = "BigArray")]
    pub cookie_key: [u8; 64],
    /// The default user password
    pub default_user_password: String,
    /// The salt for generating user passwords
    pub password_salt: String,
    /// The secret key for generating user passwords
    pub secret_key: String,
    ///  The admin's default password
    pub root_password: String,
}

impl Config {
    /// Create a new Config struct with the given config file
    pub fn new(path: &str) -> Self {
        let path = Path::new(path);
        let display = path.display();

        // Open the path in read-only mode, returns `io::Result<File>`
        let mut file = match File::open(path) {
            Err(why) => panic!("couldn't open {}: {}", display, why),
            Ok(file) => file,
        };

        // Read the file contents into a string, returns `io::Result<usize>`
        let mut serialized = String::new();
        match file.read_to_string(&mut serialized) {
            Err(why) => panic!("couldn't read {}: {}", display, why),
            Ok(_) => serde_json::from_str(&serialized).unwrap(),
        }
    }
}
