CREATE TABLE students_questions (
    id  int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    course_creator VARCHAR(10) NOT NULL,
    name_creator VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    level INT(11) NOT NULL,
    question VARCHAR(500) NOT NULL,
    answer JSON NOT NULL,
    tries INT(11) NOT NULL,
    time INT(11) NOT NULL,
    created_at TIMESTAMP NOT NULL
)DEFAULT CHARSET=utf8mb4;
