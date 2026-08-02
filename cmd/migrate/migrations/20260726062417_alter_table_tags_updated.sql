-- +goose Up
ALTER TABLE posts
ADD COLUMN tags varchar(100) [];

alter TABLE posts
ADD COLUMN updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW();

-- +goose Down
ALTER TABLE 
	posts DROP COLUMN tags;

ALTER TABLE 
	posts DROP COLUMN updated_at;
