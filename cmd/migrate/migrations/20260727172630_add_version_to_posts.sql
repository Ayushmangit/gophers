-- +goose Up
ALTER TABLE 
	posts 
ADD 
COLUMN version int DEFAULT 0;

-- +goose Down
ALTER TABLE
	posts
DROP COLUMN version;
