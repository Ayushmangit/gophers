package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
)

type Conversation struct {
	ID        int64  `json:"id"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
	OtherUser User   `json:"other_user"`
}

type Message struct {
	ID             int64  `json:"id"`
	ConversationID int64  `json:"conversation_id"`
	SenderID       int64  `json:"sender_id"`
	Content        string `json:"content"`
	CreatedAt      string `json:"created_at"`
	Sender         User   `json:"sender,omitempty"`
}

type MessageStore struct {
	db *sql.DB
}

func (s *MessageStore) CreateConversation(
	ctx context.Context,
	userID, otherUserID int64,
) (*Conversation, error) {
	if userID <= 0 || otherUserID <= 0 || userID == otherUserID {
		return nil, ErrBadRequest
	}

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	conversation := &Conversation{}

	err := withTx(s.db, ctx, func(tx *sql.Tx) error {
		// Reuse an existing direct conversation between these users.
		query := `
			SELECT c.id, c.created_at, c.updated_at
			FROM conversations c
			JOIN conversation_participants cp1
				ON cp1.conversation_id = c.id
			JOIN conversation_participants cp2
				ON cp2.conversation_id = c.id
			WHERE cp1.user_id = $1
				AND cp2.user_id = $2
				AND (
					SELECT COUNT(*)
					FROM conversation_participants cp
					WHERE cp.conversation_id = c.id
				) = 2
			LIMIT 1
		`

		err := tx.QueryRowContext(ctx, query, userID, otherUserID).Scan(
			&conversation.ID,
			&conversation.CreatedAt,
			&conversation.UpdatedAt,
		)
		if err == nil {
			return nil
		}
		if !errors.Is(err, sql.ErrNoRows) {
			return err
		}

		err = tx.QueryRowContext(ctx, `
			INSERT INTO conversations DEFAULT VALUES
			RETURNING id, created_at, updated_at
		`).Scan(
			&conversation.ID,
			&conversation.CreatedAt,
			&conversation.UpdatedAt,
		)
		if err != nil {
			return err
		}

		_, err = tx.ExecContext(ctx, `
			INSERT INTO conversation_participants (conversation_id, user_id)
			VALUES ($1, $2), ($1, $3)
		`, conversation.ID, userID, otherUserID)

		return err
	})
	if err != nil {
		return nil, err
	}

	return conversation, nil
}

func (s *MessageStore) GetConversationsByUserID(
	ctx context.Context,
	userID int64,
) ([]*Conversation, error) {
	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	query := `
		SELECT
			c.id,
			c.created_at,
			c.updated_at,
			u.id,
			u.username,
			u.email,
			u.created_at
		FROM conversations c
		JOIN conversation_participants cp
			ON cp.conversation_id = c.id
		JOIN conversation_participants other_cp
			ON other_cp.conversation_id = c.id
			AND other_cp.user_id <> cp.user_id
		JOIN users u
			ON u.id = other_cp.user_id
		WHERE cp.user_id = $1
		ORDER BY c.updated_at DESC, c.id DESC
	`

	rows, err := s.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	conversations := make([]*Conversation, 0)

	for rows.Next() {
		var conversation Conversation

		err := rows.Scan(
			&conversation.ID,
			&conversation.CreatedAt,
			&conversation.UpdatedAt,
			&conversation.OtherUser.ID,
			&conversation.OtherUser.Username,
			&conversation.OtherUser.Email,
			&conversation.OtherUser.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		conversations = append(conversations, &conversation)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return conversations, nil
}

func (s *MessageStore) GetMessagesByConversationID(
	ctx context.Context,
	conversationID, userID int64,
	limit, beforeID int64,
) ([]*Message, error) {
	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	if conversationID <= 0 || userID <= 0 {
		return nil, ErrBadRequest
	}

	// Keep pagination bounded.
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	query := `
		SELECT
			m.id,
			m.conversation_id,
			m.sender_id,
			m.content,
			m.created_at,
			u.id,
			u.username
		FROM messages m
		JOIN users u
			ON u.id = m.sender_id
		WHERE m.conversation_id = $1
			AND EXISTS (
				SELECT 1
				FROM conversation_participants cp
				WHERE cp.conversation_id = m.conversation_id
					AND cp.user_id = $2
			)
			AND ($3 = 0 OR m.id < $3)
		ORDER BY m.id DESC
		LIMIT $4
	`

	rows, err := s.db.QueryContext(
		ctx,
		query,
		conversationID,
		userID,
		beforeID,
		limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	messages := make([]*Message, 0)

	for rows.Next() {
		var message Message

		err := rows.Scan(
			&message.ID,
			&message.ConversationID,
			&message.SenderID,
			&message.Content,
			&message.CreatedAt,
			&message.Sender.ID,
			&message.Sender.Username,
		)
		if err != nil {
			return nil, err
		}

		messages = append(messages, &message)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return messages, nil
}

func (s *MessageStore) CreateMessage(
	ctx context.Context,
	message *Message,
) error {
	if message.ConversationID <= 0 || message.SenderID <= 0 ||
		strings.TrimSpace(message.Content) == "" {
		return ErrBadRequest
	}

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	return withTx(s.db, ctx, func(tx *sql.Tx) error {
		query := `
			INSERT INTO messages (conversation_id, sender_id, content)
			SELECT $1, $2, $3
			WHERE EXISTS (
				SELECT 1
				FROM conversation_participants
				WHERE conversation_id = $1
					AND user_id = $2
			)
			RETURNING id, created_at
		`

		err := tx.QueryRowContext(
			ctx,
			query,
			message.ConversationID,
			message.SenderID,
			message.Content,
		).Scan(&message.ID, &message.CreatedAt)

		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		if err != nil {
			return err
		}

		result, err := tx.ExecContext(ctx, `
			UPDATE conversations
			SET updated_at = NOW()
			WHERE id = $1
		`, message.ConversationID)
		if err != nil {
			return err
		}

		affected, err := result.RowsAffected()
		if err != nil {
			return err
		}
		if affected == 0 {
			return fmt.Errorf("update conversation timestamp: %w", ErrNotFound)
		}

		return nil
	})
}

func (s *MessageStore) GetOtherParticipantID(
	ctx context.Context,
	conversationID, userID int64,
) (int64, error) {
	if conversationID <= 0 || userID <= 0 {
		return 0, ErrBadRequest
	}

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	var otherUserID int64

	err := s.db.QueryRowContext(ctx, `
		SELECT other_cp.user_id
		FROM conversation_participants my_cp
		JOIN conversation_participants other_cp
			ON other_cp.conversation_id = my_cp.conversation_id
			AND other_cp.user_id <> my_cp.user_id
		WHERE my_cp.conversation_id = $1
			AND my_cp.user_id = $2
		LIMIT 1
	`, conversationID, userID).Scan(&otherUserID)

	if errors.Is(err, sql.ErrNoRows) {
		return 0, ErrNotFound
	}
	if err != nil {
		return 0, err
	}

	return otherUserID, nil
}
