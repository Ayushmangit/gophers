package main

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/Ayushmangit/social/internal/store"
	"github.com/go-chi/chi/v5"
)

type userKey string

const userCtx userKey = "user"

type UserWithMetadata struct {
	User        *store.User `json:"user"`
	IsFollowing bool        `json:"is_following"`
}

// GetUser godoc
//
//	@Summary		Fetches a user profile
//	@Description	Fetches a user profile by ID
//	@Tags			users
//	@Accept			json
//	@Produce		json
//	@Param			userID	path		int	true	"user ID"
//	@Success		200		{object}	store.User
//	@Failure		400		{object}	error
//	@Failure		404		{object}	error
//	@Failure		500		{object}	error
//	@Security		ApiKeyAuth
//	@Router			/users/{userID} [get]
func (app *application) getUserHandler(w http.ResponseWriter, r *http.Request) {

	authenticatedUser := getUserFromCtx(r)
	fmt.Printf("%v", authenticatedUser)
	userID := chi.URLParam(r, "userID")
	id, err := strconv.ParseInt(userID, 10, 64)
	if err != nil {
		app.BadRequest(w, r, err)
		return
	}

	user, err := app.getUser(r.Context(), id)
	if err != nil {
		switch err {
		case store.ErrNotFound:
			app.NotFound(w, r, err)
		default:
			app.InternalServerError(w, r, err)
		}
		return
	}

	isFollowing, err := app.store.Followers.IsFollowing(r.Context(), authenticatedUser.ID, id)
	if err != nil {
		app.InternalServerError(w, r, err)
		return
	}

	response := &UserWithMetadata{
		user,
		isFollowing,
	}
	if err := app.jsonResponse(w, http.StatusOK, response); err != nil {
		app.InternalServerError(w, r, err)
		return
	}
}

// FollowUser godoc
//
//	@Summary		Follows a user
//	@Description	Follows a user by ID
//	@Tags			users
//	@Accept			json
//	@Produce		json
//	@Param			userID	path	int	true	"user ID"
//	@Success		204		"followed"
//	@Failure		404		{object}	error
//	@Security		ApiKeyAuth
//	@Router			/users/{userID}/follow [put]
func (app *application) followUserHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	follower := getUserFromCtx(r)
	followeeID, err := strconv.ParseInt(chi.URLParam(r, "userID"), 10, 64)

	if err != nil {
		app.BadRequest(w, r, err)
	}

	if err := app.store.Followers.Follow(ctx, follower.ID, followeeID); err != nil {
		switch err {
		case store.ErrConflict:
			app.Conflict(w, r, err)
		default:
			app.InternalServerError(w, r, err)
		}
		return
	}

	if err := app.jsonResponse(w, http.StatusNoContent, ""); err != nil {
		app.InternalServerError(w, r, err)
		return
	}
}

// searchUsersHandler godoc
//
//	@Summary		Search users
//	@Description	Searches for users by username
//	@Tags			users
//	@Accept			json
//	@Produce		json
//	@Param			username	query		string	true	"Username to search for"
//	@Success		200			{array}		store.User
//	@Failure		400			{object}	error
//	@Failure		401			{object}	error
//	@Failure		500			{object}	error
//	@Security		ApiKeyAuth
//	@Router			/users/search [get]
func (app *application) searchUsersHandler(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	app.logger.Infow(
		"searching users",
		"username",
		username,
	)
	if strings.TrimSpace(username) == "" {
		app.BadRequest(w, r, errors.New("username is required"))
		return
	}
	users, err := app.store.Users.GetByUsername(r.Context(), username)
	if err != nil {
		app.InternalServerError(w, r, err)
		return
	}
	if users == nil {
		users = []*store.User{}
	}
	if err := app.jsonResponse(w, http.StatusOK, users); err != nil {
		app.InternalServerError(w, r, err)
		return
	}
}

// UnFollowUser godoc
//
//	@Summary		Unfollows a user
//	@Description	Unfollows a user by ID
//	@Tags			users
//	@Accept			json
//	@Produce		json
//	@Param			userID	path	int	true	"user ID"
//	@Success		204		"unfollowed"
//	@Failure		404		{object}	error
//	@Security		ApiKeyAuth
//	@Router			/users/{userID}/unfollow [put]
func (app *application) unfollowUserHandler(w http.ResponseWriter, r *http.Request) {
	follower := getUserFromCtx(r)
	followeeID, err := strconv.ParseInt(chi.URLParam(r, "userID"), 10, 64)
	if err != nil {
		app.BadRequest(w, r, err)
		return
	}
	ctx := r.Context()

	if err := app.store.Followers.UnFollow(ctx, follower.ID, followeeID); err != nil {
		app.InternalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusNoContent, ""); err != nil {
		app.InternalServerError(w, r, err)
		return
	}
}

// activateUserHandler godoc
//
//	@Summary		Activates/Register a user
//	@Description	Activates/Register a user by invitation token
//	@Tags			users
//	@Produce		json
//	@Param			token	path	string	true	"invitation token"
//	@Success		204		"user activated"
//	@Failure		404		{object}	error
//	@Failure		500		{object}	error
//	@Security		ApiKeyAuth
//	@Router			/users/activate/{token} [put]
func (app *application) activateUserHandler(w http.ResponseWriter, r *http.Request) {
	token := chi.URLParam(r, "token")
	err := app.store.Users.Activate(r.Context(), token)
	if err != nil {
		switch err {
		case store.ErrNotFound:
			app.NotFound(w, r, err)
		default:
			app.InternalServerError(w, r, err)
		}
		return
	}
	if err := app.jsonResponse(w, http.StatusOK, ""); err != nil {
		app.InternalServerError(w, r, err)
		return
	}
}

//	func (app *application) userContextMiddleware(next http.Handler) http.Handler {
//		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
//			userID := chi.URLParam(r, "userID")
//			id, err := strconv.ParseInt(userID, 10, 64)
//			if err != nil {
//				app.BadRequest(w, r, err)
//				return
//			}
//			ctx := r.Context()
//
//			user, err := app.store.Users.GetByID(ctx, id)
//			if err != nil {
//				switch err {
//				case store.ErrNotFound:
//					app.NotFound(w, r, err)
//				default:
//					app.InternalServerError(w, r, err)
//				}
//				return
//			}
//
//			ctx = context.WithValue(ctx, userCtx, user)
//			next.ServeHTTP(w, r.WithContext(ctx))
//		})
//	}
func getUserFromCtx(r *http.Request) *store.User {
	user, _ := r.Context().Value(userCtx).(*store.User)
	return user
}
