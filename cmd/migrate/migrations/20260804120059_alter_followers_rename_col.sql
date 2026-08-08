-- +goose Up
ALTER TABLE followers
RENAME COLUMN user_id TO followee_id;

-- +goose Down
ALTER TABLE followers
RENAME COLUMN followee_id TO user_id;
