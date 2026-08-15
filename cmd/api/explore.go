package main

import (
	"net/http"

	"github.com/Ayushmangit/social/internal/store"
)

// Explore godoc
//
// @Summary		Fetches all posts
// @Description	Fetches all posts
// @Tags			feed
// @Accept			json
// @Produce		json
// @Success		200	{array}		store.PostWithMetadata
// @Failure		400	{object}	error
// @Failure		404	{object}	error
// @Failure		500	{object}	error
// @Security		ApiKeyAuth
// @Router			/users/explore [get]
func (app *application) explorePostHandler(w http.ResponseWriter, r *http.Request) {
	fq := store.PaginatedQuery{
		Limit:  20,
		Offset: 0,
		Sort:   "desc",
	}

	fq, err := fq.Parse(r)
	if err != nil {
		app.BadRequest(w, r, err)
		return
	}

	posts, err := app.store.Posts.GetAllPosts(r.Context(), fq)
	if err != nil {
		app.InternalServerError(w, r, err)
		return
	}
	if err := app.jsonResponse(w, http.StatusOK, posts); err != nil {
		app.InternalServerError(w, r, err)
		return
	}
}
