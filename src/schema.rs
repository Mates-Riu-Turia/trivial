// @generated automatically by Diesel CLI.

diesel::table! {
    preguntas (codi_pregunta) {
        codi_pregunta -> Integer,
        assignatura -> Text,
        nivell -> Integer,
        text -> Text,
        no_mostrar -> Integer,
        respostes -> Text,
        intents -> Integer,
        temps -> Integer,
        imatge -> Text,
        data -> Datetime,
        verificada -> Integer,
        modificada -> Integer,
    }
}

diesel::table! {
    users (email) {
        name -> Varchar,
        email -> Varchar,
        hash -> Varchar,
        created_at -> Timestamp,
    }
}

diesel::allow_tables_to_appear_in_same_query!(preguntas, users,);
