CREATE EXTENSION IF NOT EXISTS CITEXT;

DROP Table IF EXISTS users CASCADE;
DROP Table IF EXISTS forums CASCADE;

CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL   PRIMARY KEY,
    nickname    CITEXT      UNIQUE NOT NULL,
    fullname    VARCHAR,
    about       TEXT,
    email       CITEXT      UNIQUE
);

CREATE TABLE IF NOT EXISTS forums (
    id              BIGSERIAL   PRIMARY KEY,
    slug            CITEXT      UNIQUE NOT NULL,
    title           VARCHAR     NOT NULL,
    user_id         BIGSERIAL   NOT NULL REFERENCES users(id),
    user_nickname   CITEXT      NOT NULL REFERENCES users(nickname),
    posts           INTEGER     DEFAULT 0,
    threads         INTEGER     DEFAULT 0
);
