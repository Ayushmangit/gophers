package store

import (
	"context"
	"database/sql"
)

type CommentStore struct {
	db *sql.DB
}

type Comment struct {
	ID        int64  `json:"id"`
	PostID    int64  `json:"post_id"`
	UserID    int64  `json:"user_id"`
	Content   string `json:"content"`
	CreatedAt string `json:"created_at"`
	User      User   `json:"user"`
}

func (s *CommentStore) GetByPostID(ctx context.Context, postID int64) ([]*Comment, error) {

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()
	query := `
		select c.id,c.post_id,c.user_id,c.content,c.created_at, users.username,users.id from comments c 
		join users on users.id = c.user_id
		where c.post_id = $1
		order by c.created_at DESC;
	`
	rows, err := s.db.QueryContext(ctx, query, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	comments := make([]*Comment, 0)
	for rows.Next() {
		var c Comment
		c.User = User{}
		err := rows.Scan(
			&c.ID,
			&c.PostID,
			&c.UserID,
			&c.Content,
			&c.CreatedAt,
			&c.User.Username,
			&c.User.ID)
		if err != nil {
			return comments, err
		}
		comments = append(comments, &c)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return comments, nil
}

func (s *CommentStore) Create(ctx context.Context, comment *Comment) (*Comment, error) {
	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	query := `
		WITH new_comment AS (
			INSERT INTO comments (
				post_id,
				user_id,
				content
			)
			VALUES ($1, $2, $3)
			RETURNING
				id,
				post_id,
				user_id,
				content,
				created_at
		)
		SELECT
			c.id,
			c.post_id,
			c.user_id,
			c.content,
			c.created_at,

			u.id,
			u.username,
			u.email,
			u.created_at

		FROM new_comment c
		INNER JOIN users u
			ON u.id = c.user_id
	`

	var createdComment Comment

	err := s.db.QueryRowContext(
		ctx,
		query,
		comment.PostID,
		comment.UserID,
		comment.Content,
	).Scan(
		// Comment
		&createdComment.ID,
		&createdComment.PostID,
		&createdComment.UserID,
		&createdComment.Content,
		&createdComment.CreatedAt,

		// User
		&createdComment.User.ID,
		&createdComment.User.Username,
		&createdComment.User.Email,
		&createdComment.User.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &createdComment, nil
}
