-- +goose Up
CREATE TABLE IF NOT EXISTS followers(
	user_id bigint not null,
	follower_id bigint not null,
	created_at timestamp(0) with time zone not null default now(),

	primary key (user_id,follower_id),
	foreign key (user_id) references users (id) on delete CASCADE,
	foreign key (follower_id) references users (id) on delete CASCADE
);


-- +goose Down
DROP TABLE IF EXISTS followers;
