CREATE EXTENSION IF NOT EXISTS CITEXT;

DROP Table IF EXISTS users CASCADE;
DROP Table IF EXISTS forums CASCADE;
DROP Table IF EXISTS threads CASCADE;

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
    owner_id        BIGSERIAL   NOT NULL REFERENCES users(id),
    owner_nickname  CITEXT      NOT NULL REFERENCES users(nickname),
    posts           INTEGER     DEFAULT 0,
    threads         INTEGER     DEFAULT 0
);

CREATE TABLE IF NOT EXISTS threads (
    id              BIGSERIAL                   PRIMARY KEY,
    slug            CITEXT                      UNIQUE,
    author_id       BIGSERIAL                   NOT NULL REFERENCES users(id),
    author_nickname CITEXT                      NOT NULL REFERENCES users(nickname),
    forum_id        BIGSERIAL                   NOT NULL REFERENCES forums(id),
    forum_slug      CITEXT                      NOT NULL REFERENCES forums(slug),
    created         TIMESTAMP WITH TIME ZONE    DEFAULT NOW(),
    title           VARCHAR                     NOT NULL,
    message         VARCHAR                     NOT NULL,
    votes           INTEGER                     DEFAULT 0
);
