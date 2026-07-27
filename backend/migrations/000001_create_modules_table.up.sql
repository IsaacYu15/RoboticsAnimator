CREATE TABLE modules (
    id      SERIAL PRIMARY KEY,
    type    VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    name    VARCHAR(255) NOT NULL UNIQUE
);