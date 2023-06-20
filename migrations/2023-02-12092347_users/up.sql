CREATE TABLE users (
    name VARCHAR(122) NOT NULL,
    email VARCHAR(100) NOT NULL PRIMARY KEY,
    hash VARCHAR(122) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    gender VARCHAR(1) NOT NULL,
    role VARCHAR(1) NOT NULL,
    password_changed BOOLEAN NOT NULL
);