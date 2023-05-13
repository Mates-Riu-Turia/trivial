CREATE TABLE users (
    name VARCHAR(122) NOT NULL,
    email VARCHAR(100) NOT NULL PRIMARY KEY,
    hash VARCHAR(122) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    gender VARCHAR(1) NOT NULL,
    role VARCHAR(1) NOT NULL,
    password_changed BOOLEAN NOT NULL
);
INSERT INTO `trivial`.`users` (`name`, `email`, `hash`, `created_at`, `gender`, `role`, `password_changed`) VALUES ('Juan José Asensio García', 'asengar2009@gmail.com', '$argon2i$v=19$m=4096,t=3,p=1$c3VwZXJzZWN1cmVzYWx0$b5NvQOJrpW0WRgp9n/7vSVZCtgW884WxWJxbD9ie2WU', '2023-03-16 14:33:39', 'B', 'A', '0');