package main

import (
	"net/http"

	"github.com/Ayushmangit/social/internal/store"
)

type CreateCommentPayload struct {
	Content string `json:"content" validate:"required,max=1000"`
}

// CreateComment godoc
//
//	@Summary		Comment on a post
//	@Description	Comments on a post with ID
//	@Tags			comments
//	@Accept			json
//	@Produce		json
//	@Param			postID	path		int						true	"post ID"
//	@Param			request	body		CreateCommentPayload	true	"comment create payload"
//	@Success		200		{object}	store.Comment
//	@Failure		400		{object}	error
//	@Failure		404		{object}	error
//	@Failure		500		{object}	error
//	@Security		ApiKeyAuth
//	@Router			/posts/{postID}/comment [post]
func (app *application) createCommentHandler(w http.ResponseWriter, r *http.Request) {
	post := getPostFromCtx(r)
	var payload CreateCommentPayload
	if err := ReadJson(w, r, &payload); err != nil {
		app.BadRequest(w, r, err)
		return
	}

	if err := Validate.Struct(&payload); err != nil {
		app.BadRequest(w, r, err)
		return
	}

	comment := &store.Comment{
		PostID: post.ID,
		//TODO: change the user id when JWT is Done
		UserID:  79,
		Content: payload.Content,
	}
	if err := app.store.Comments.Create(r.Context(), comment); err != nil {
		app.InternalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, comment); err != nil {
		app.InternalServerError(w, r, err)
		return
	}

}
