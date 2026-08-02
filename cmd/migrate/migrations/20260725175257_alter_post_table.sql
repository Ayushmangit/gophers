-- +goose Up
ALTER table
	posts
ADD
	CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id);

-- +goose Down
ALTER table 
	posts DROP CONSTRAINT fk_user;
