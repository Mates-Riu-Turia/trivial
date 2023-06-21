CREATE TABLE questions (
    id  int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    level INT(11) NOT NULL,
    question VARCHAR(500) NOT NULL,
    hide BOOLEAN NOT NULL,
    answer JSON NOT NULL,
    tries INT(11) NOT NULL,
    time INT(11) NOT NULL,
    image VARCHAR(100) NOT NULL,
    bigger BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    verified BOOLEAN NOT NULL,
    creator VARCHAR(100) NOT NULL
)DEFAULT CHARSET=utf8mb4;
