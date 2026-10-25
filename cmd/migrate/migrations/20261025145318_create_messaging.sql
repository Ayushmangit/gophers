-- +goose Up
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE conversation_participants (
    conversation_id BIGINT NOT NULL
        REFERENCES conversations(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_read_at TIMESTAMP(0) WITH TIME ZONE,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_conversation_participants_user_id
    ON conversation_participants(user_id, conversation_id);

CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL
        REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL
        CHECK (char_length(btrim(content)) > 0),
    created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_created
    ON messages(conversation_id, created_at, id);

-- +goose Down
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversation_participants;
DROP TABLE IF EXISTS conversations;
