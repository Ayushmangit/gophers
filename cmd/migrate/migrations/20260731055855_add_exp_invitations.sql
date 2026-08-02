-- +goose Up
ALTER table user_invitations ADD COLUMN expiry TIMESTAMP(0) WITH TIME ZONE NOT NULL;

-- +goose Down
ALTER table user_invitations drop column expiry;
