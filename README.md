# TRIVIAL from IES Riu Túria

## About

This project use is to make a simple interface to a Trivial hosted in the HighSchool.
The students can create some questions at the end of the unit. Then their teachers will correct them for adding them to the final game.
The game, is really similar to the orginal board game of the Trivial, it has got a board, a timer, a ranking and a place for the questions. It is multiuser so you can play anywhere with anyone.

## Technologies used

It is written in HTML5, JS, CSS3 and Bootstrap5 for the frontend. And Rust for the backend.
The IDE that I used is VS Code.
As a wish, I want to translate the frontend to a React.js based application, this would help for code readbility. 

## License

This project is licensed under GPL3. You can check license in LICENSE and the code of conduct in CODE_OF_CONDUCT.md files.
Feel free to fill an issue or open a pull request. You are welcome!

## Installation

(This proccess can change depending on your Operating System. This is tested on Ubuntu Linux)

For installing it:
- Install MySql or MariaDB and it's binary library.
- Install Rust Lang.
- Install Rust Diesel (``cargo install diesel_cli --no-default-features --features mysql``)
- Clone this repo into your working directory (``git clone https:://github.com/asensio_project/trivial_packager``)
- Modify diesel.toml with your MySql user
- Execute ``diesel migration run`` for creating DB tables
- Modify config.toml for configuring the port and the server
- Execute ``cargo run``
- Enjoy it!

