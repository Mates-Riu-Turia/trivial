CREATE TABLE questions (
    subject VARCHAR(100) NOT NULL,
    level INT(11) NOT NULL,
    question VARCHAR(500) NOT NULL PRIMARY KEY,
    hide INT(11) NOT NULL,
    answers VARCHAR(50) NOT NULL,
    tries INT(11) NOT NULL,
    time INT(11) NOT NULL,
    image VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    verified BOOLEAN NOT NULL,
    modified BOOLEAN NOT NULL
)DEFAULT CHARSET=utf8mb4;
