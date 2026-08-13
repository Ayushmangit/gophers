package store

import (
	"context"
	"database/sql"
	"errors"

	"github.com/lib/pq"
)

type Post struct {
	ID           int64      `json:"id"`
	Content      string     `json:"content"`
	Title        string     `json:"title"`
	UserID       int64      `json:"user_id"`
	Tags         []string   `json:"tags"`
	CreatedAt    string     `json:"created_at"`
	UpdatedAt    string     `json:"updated_at"`
	Version      int        `json:"version"`
	Comments     []*Comment `json:"comments"`
	CommentCount int        `json:"comment_count"`
	User         User       `json:"user"`
}

type PostWithMetadata struct {
	Post
	CommentCount int `json:"comment_count"`
}

type PostStore struct {
	db *sql.DB
}

func (s *PostStore) Create(ctx context.Context, post *Post) error {

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()
	query := `
	insert into Posts (content,title,user_id,tags)
	VALUES ($1,$2,$3,$4) RETURNING id,created_at,updated_at
	`
	err := s.db.QueryRowContext(ctx,
		query,
		post.Content,
		post.Title,
		post.UserID,
		pq.Array(post.Tags),
	).Scan(
		&post.ID,
		&post.CreatedAt,
		&post.UpdatedAt,
	)
	if err != nil {
		return err
	}
	return nil
}

func (s *PostStore) GetByID(ctx context.Context, id int64) (*Post, error) {
	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	query := `
		SELECT
			p.id,
			p.content,
			p.title,
			p.user_id,
			p.tags,
			p.created_at,
			p.updated_at,
			p.version,
			COUNT(c.id) AS comment_count,

			u.id,
			u.username,
			u.email,
			u.created_at

		FROM posts p

		INNER JOIN users u
			ON u.id = p.user_id

		LEFT JOIN comments c
			ON c.post_id = p.id

		WHERE p.id = $1

		GROUP BY
			p.id,
			p.content,
			p.title,
			p.user_id,
			p.tags,
			p.created_at,
			p.updated_at,
			p.version,
			u.id,
			u.username,
			u.email,
			u.created_at
	`

	var post Post

	err := s.db.QueryRowContext(ctx, query, id).Scan(
		// Post
		&post.ID,
		&post.Content,
		&post.Title,
		&post.UserID,
		pq.Array(&post.Tags),
		&post.CreatedAt,
		&post.UpdatedAt,
		&post.Version,
		&post.CommentCount,

		// User
		&post.User.ID,
		&post.User.Username,
		&post.User.Email,
		&post.User.CreatedAt,
	)

	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNotFound
		default:
			return nil, err
		}
	}

	// Always return an empty array instead of null.
	post.Comments = make([]*Comment, 0)

	return &post, nil
}
func (s *PostStore) DeleteByID(ctx context.Context, id int64) error {
	query := `
	DELETE FROM posts where id = $1;
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	result, err := s.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *PostStore) Update(ctx context.Context, post *Post) error {

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	query := `
	UPDATE posts
	SET title = $1, content = $2, version = version + 1 where id = $3 AND version = $4
	RETURNING version
	`
	err := s.db.QueryRowContext(ctx,
		query,
		post.Title,
		post.Content,
		post.ID,
		post.Version,
	).Scan(&post.Version)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return ErrNotFound
		default:
			return err
		}
	}
	return nil
}

func (s *PostStore) GetUserFeed(ctx context.Context, userID int64, fq PaginatedFeedQuery) ([]PostWithMetadata, error) {
	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()
	query := `
	SELECT 
		p.id,
		p.user_id,
		p.title,
		p.content,
		p.created_at,
		p.version,
		p.tags,
		u.username,
		count(c.id) AS comments_count
    FROM posts p
	LEFT JOIN comments c ON c.post_id = p.id
	LEFT JOIN users u ON p.user_id = u.id
	JOIN followers f ON f.followee_id = p.user_id 
	WHERE 
		f.follower_id = $1 AND
		(p.title ILIKE '%' || $4 || '%' OR p.content ILIKE '%' || $4 || '%') 
	OR (p.tags @> $5 OR $5 = '{}') 
	GROUP BY p.id,u.username ORDER BY p.created_at ` + fq.Sort + `
	LIMIT $2 OFFSET $3`

	rows, err := s.db.QueryContext(ctx, query, userID, fq.Limit, fq.Offset, fq.Search, pq.Array(fq.Tags))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var feed []PostWithMetadata
	for rows.Next() {
		var p PostWithMetadata
		err := rows.Scan(
			&p.ID,
			&p.UserID,
			&p.Title,
			&p.Content,
			&p.CreatedAt,
			&p.Version,
			pq.Array(&p.Tags),
			&p.User.Username,
			&p.CommentCount,
		)
		if err != nil {
			return nil, err
		}
		feed = append(feed, p)
	}

	return feed, nil
}
