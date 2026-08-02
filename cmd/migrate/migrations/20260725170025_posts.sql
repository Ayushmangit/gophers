-- +goose Up
CREATE TABLE IF NOT EXISTS posts(
	id bigserial PRIMARY KEY,
	title text NOT NULL,
	user_id bigint NOT NULL,
	content text NOT NULL,
	created_at timestamp(0) with time zone NOT NULL DEFAULT NOW()
);

-- +goose Down
DROP TABLE IF  EXISTS posts;
