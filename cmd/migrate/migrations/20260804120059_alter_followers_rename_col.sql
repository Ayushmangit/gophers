-- +goose Up
ALTER TABLE followers
RENAME COLUMN user_id TO followee_id;

-- +goose Down
ALTER TABLE followers
RENAME COLUMN follower_id TO follower_id;
