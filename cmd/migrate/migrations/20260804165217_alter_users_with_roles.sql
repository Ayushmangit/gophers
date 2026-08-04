-- +goose Up
ALTER TABLE IF EXISTS users ADD COLUMN role_id INT REFERENCES roles(id) DEFAULT 1;

UPDATE users 
SET role_id = (
select id from roles where name = 'user'
);

ALTER TABLE users ALTER COLUMN role_id DROP DEFAULT;

ALTER TABLE users ALTER column role_id set NOT NULL;
-- +goose Down
ALTER TABLE IF EXISTS users DROP COLUMN role_id;
