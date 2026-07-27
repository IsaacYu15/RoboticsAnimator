CREATE TABLE assets (
    id      SERIAL PRIMARY KEY,
    type    VARCHAR(255) NOT NULL,
    name    VARCHAR(255) NOT NULL,
    colour  VARCHAR(255) NOT NULL,
    config  JSONB NOT NULL
);