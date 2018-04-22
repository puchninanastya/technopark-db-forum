CREATE EXTENSION IF NOT EXISTS CITEXT;

DROP Table IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL   PRIMARY KEY,
    nickname    CITEXT      UNIQUE NOT NULL,
    fullname    VARCHAR,
    about       TEXT,
    email       CITEXT      UNIQUE
);
