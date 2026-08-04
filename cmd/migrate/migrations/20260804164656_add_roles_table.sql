-- +goose Up
CREATE TABLE IF NOT EXISTS roles(
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL UNIQUE,
	level INT NOT NULL DEFAULT 0,
	description TEXT
);

INSERT INTO 
	roles (name,description,level)
values (
	'user',
	'A user can create posts and comments',
	1
);

INSERT INTO 
	roles (name,description,level)
values (
	'moderator',
	'A moderator can update other users posts ',
	2
);

INSERT INTO 
	roles (name,description,level)
values (
	'admin',
	'A admin can Delete a users post',
	3
);

-- +goose Down
DROP TABLE IF EXISTS roles;

