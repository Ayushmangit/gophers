package store

import (
	"context"
	"database/sql"

	"github.com/lib/pq"
)

type Follower struct {
	FollowerID int64  `json:"follower_id"`
	FolloweeID int64  `json:"followee_id"`
	Created_at string `json:"created_at"`
}

type FollowerStore struct {
	db *sql.DB
}

func (s *FollowerStore) Follow(ctx context.Context, followerID, followeeID int64) error {
	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()
	query := `
	INSERT INTO followers (follower_id,followee_id) values($1,$2);

	`
	_, err := s.db.ExecContext(ctx, query, followerID, followeeID)
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			return ErrConflict
		}
	}
	return nil
}

func (s *FollowerStore) UnFollow(ctx context.Context, followerID, followeeID int64) error {
	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()
	query := `
	DELETE FROM followers where follower_id = $1 AND followee_id = $2;

	`
	_, err := s.db.ExecContext(ctx, query, followerID, followeeID)
	return err
}
