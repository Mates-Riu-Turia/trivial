// @generated automatically by Diesel CLI.

diesel::table! {
    courses (id) {
        id -> Varchar,
        anatomia -> Nullable<Varchar>,
        english -> Nullable<Varchar>,
        biologia -> Nullable<Varchar>,
        castellano -> Nullable<Varchar>,
        clasica -> Nullable<Varchar>,
        dibuix -> Nullable<Varchar>,
        ed_fisica -> Nullable<Varchar>,
        filosofia -> Nullable<Varchar>,
        fisica_quimica -> Nullable<Varchar>,
        frances -> Nullable<Varchar>,
        historia -> Nullable<Varchar>,
        grec -> Nullable<Varchar>,
        informatica -> Nullable<Varchar>,
        literatura -> Nullable<Varchar>,
        llati -> Nullable<Varchar>,
        mates -> Nullable<Varchar>,
        musica -> Nullable<Varchar>,
        orientacio -> Nullable<Varchar>,
        plastica -> Nullable<Varchar>,
        religio -> Nullable<Varchar>,
        tecnologia -> Nullable<Varchar>,
        valencia -> Nullable<Varchar>,
        etica -> Nullable<Varchar>,
    }
}

diesel::table! {
    questions (question) {
        subject -> Varchar,
        level -> Integer,
        question -> Varchar,
        hide -> Integer,
        answers -> Varchar,
        tries -> Integer,
        time -> Integer,
        image -> Varchar,
        created_at -> Timestamp,
        verified -> Bool,
        modified -> Bool,
    }
}

diesel::table! {
    students_questions (question) {
        course_creator -> Varchar,
        name_creator -> Varchar,
        subject -> Varchar,
        level -> Integer,
        question -> Varchar,
        hide -> Integer,
        answers -> Varchar,
        tries -> Integer,
        time -> Integer,
        image -> Varchar,
        created_at -> Timestamp,
        verified -> Bool,
        modified -> Bool,
    }
}

diesel::table! {
    users (email) {
        name -> Varchar,
        email -> Varchar,
        hash -> Varchar,
        created_at -> Timestamp,
        gender -> Varchar,
        role -> Varchar,
        password_changed -> Bool,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    courses,
    questions,
    students_questions,
    users,
);
