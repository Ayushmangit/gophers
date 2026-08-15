package main

import (
	"net/http"

	"github.com/Ayushmangit/social/internal/store"
)

// GetUserFeed godoc
//
//	@Summary		Fetches the user feed
//	@Description	Fetches the user's feed
//	@Tags			feed
//	@Accept			json
//	@Produce		json
//	@Param			since	query		string	false	"Since"
//	@Param			until	query		string	false	"until"
//	@Param			limit	query		int		false	"Number of posts to return"	default(20)
//	@Param			offset	query		int		false	"Pagination offset"			default(0)
//	@Param			sort	query		string	false	"Sort order"				Enums(asc,desc)	default(desc)
//	@Param			tags	query		string	false	"Tags"
//	@Param			search	query		string	false	"Search"
//	@Success		200		{array}		store.PostWithMetadata
//	@Failure		400		{object}	error
//	@Failure		404		{object}	error
//	@Failure		500		{object}	error
//	@Security		ApiKeyAuth
//	@Router			/users/feed [get]
func (app *application) getUserFeedHandler(w http.ResponseWriter, r *http.Request) {

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

	if err := Validate.Struct(fq); err != nil {
		app.BadRequest(w, r, err)
		return
	}

	ctx := r.Context()
	user := getUserFromCtx(r)
	feed, err := app.store.Posts.GetUserFeed(ctx, user.ID, fq)
	if err != nil {
		app.InternalServerError(w, r, err)
		return
	}
	if err := app.jsonResponse(w, http.StatusOK, feed); err != nil {
		app.InternalServerError(w, r, err)
		return
	}
}
