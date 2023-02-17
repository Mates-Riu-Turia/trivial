use serde::Deserialize;
use serde_big_array::BigArray;
use std::{fs::File, io::Read, path::Path};

#[derive(Deserialize)]
pub struct Config {
    pub domain: String,
    pub port: u16,
    pub db_url: String,
    #[serde(with = "BigArray")]
    pub cookie_key: [u8; 64],
}

impl Config {
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
            Ok(_) => return serde_json::from_str(&serialized).unwrap(),
        }
    }
}
