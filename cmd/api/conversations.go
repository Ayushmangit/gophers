package main

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/Ayushmangit/social/internal/store"
	"github.com/go-chi/chi/v5"
)

type CreateConversationPayload struct {
	OtherUserID int64 `json:"other_user_id" validate:"required,gt=0"`
}

type CreateMessagePayload struct {
	Content string `json:"content" validate:"required,max=5000"`
}

// CreateConversation godoc
//
//	@Summary		Create or retrieve a direct conversation
//	@Description	Creates a direct conversation with another user, or returns the existing conversation.
//	@Tags			conversations
//	@Accept			json
//	@Produce		json
//	@Param			request	body		CreateConversationPayload	true	"Conversation payload"
//	@Success		200		{object}	store.Conversation
//	@Failure		400		{object}	error
//	@Failure		401		{object}	error
//	@Failure		404		{object}	error
//	@Failure		500		{object}	error
//	@Security		ApiKeyAuth
//	@Router			/conversations/ [post]
func (app *application) createConversationHandler(w http.ResponseWriter, r *http.Request) {
	var payload CreateConversationPayload

	if err := ReadJson(w, r, &payload); err != nil {
		app.BadRequest(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.BadRequest(w, r, err)
		return
	}

	user := getUserFromCtx(r)

	conversation, err := app.store.Messages.CreateConversation(
		r.Context(),
		user.ID,
		payload.OtherUserID,
	)
	if err != nil {
		switch {
		case errors.Is(err, store.ErrBadRequest):
			app.BadRequest(w, r, err)
		case errors.Is(err, store.ErrNotFound):
			app.NotFound(w, r, err)
		default:
			app.InternalServerError(w, r, err)
		}
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, conversation); err != nil {
		app.InternalServerError(w, r, err)
	}
}

// GetConversations godoc
//
//	@Summary		Get the current user's conversations
//	@Description	Returns all direct conversations belonging to the authenticated user.
//	@Tags			conversations
//	@Produce		json
//	@Success		200	{array}		store.Conversation
//	@Failure		401	{object}	error
//	@Failure		500	{object}	error
//	@Security		ApiKeyAuth
//	@Router			/conversations/ [get]
func (app *application) getConversationsHandler(w http.ResponseWriter, r *http.Request) {
	user := getUserFromCtx(r)

	conversations, err := app.store.Messages.GetConversationsByUserID(
		r.Context(),
		user.ID,
	)
	if err != nil {
		app.InternalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, conversations); err != nil {
		app.InternalServerError(w, r, err)
	}
}

// GetConversationMessages godoc
//
//	@Summary		Get conversation messages
//	@Description	Returns paginated message history for a conversation the authenticated user participates in.
//	@Tags			conversations
//	@Produce		json
//	@Param			conversationID	path		int	true	"Conversation ID"
//	@Param			limit			query		int	false	"Maximum messages to return (default 50, maximum 100)"
//	@Param			before_id		query		int	false	"Return messages with IDs less than this ID"
//	@Success		200				{array}		store.Message
//	@Failure		400				{object}	error
//	@Failure		401				{object}	error
//	@Failure		500				{object}	error
//	@Security		ApiKeyAuth
//	@Router			/conversations/{conversationID}/messages/ [get]
func (app *application) getConversationMessagesHandler(w http.ResponseWriter, r *http.Request) {
	conversationID, err := strconv.ParseInt(
		chi.URLParam(r, "conversationID"),
		10,
		64,
	)
	if err != nil || conversationID <= 0 {
		app.BadRequest(w, r, errors.New("invalid conversation ID"))
		return
	}

	limit := int64(50)
	if value := r.URL.Query().Get("limit"); value != "" {
		limit, err = strconv.ParseInt(value, 10, 64)
		if err != nil || limit <= 0 {
			app.BadRequest(w, r, errors.New("limit must be a positive integer"))
			return
		}
	}

	var beforeID int64
	if value := r.URL.Query().Get("before_id"); value != "" {
		beforeID, err = strconv.ParseInt(value, 10, 64)
		if err != nil || beforeID <= 0 {
			app.BadRequest(w, r, errors.New("before_id must be a positive integer"))
			return
		}
	}

	user := getUserFromCtx(r)

	messages, err := app.store.Messages.GetMessagesByConversationID(
		r.Context(),
		conversationID,
		user.ID,
		limit,
		beforeID,
	)
	if err != nil {
		app.InternalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, messages); err != nil {
		app.InternalServerError(w, r, err)
	}
}

// CreateMessage godoc
//
//	@Summary		Send a message
//	@Description	Persists a message in a conversation where the authenticated user is a participant.
//	@Tags			conversations
//	@Accept			json
//	@Produce		json
//	@Param			conversationID	path		int						true	"Conversation ID"
//	@Param			request			body		CreateMessagePayload	true	"Message payload"
//	@Success		201				{object}	store.Message
//	@Failure		400				{object}	error
//	@Failure		401				{object}	error
//	@Failure		404				{object}	error
//	@Failure		500				{object}	error
//	@Security		ApiKeyAuth
//	@Router			/conversations/{conversationID}/messages/ [post]
func (app *application) createMessageHandler(w http.ResponseWriter, r *http.Request) {
	conversationID, err := strconv.ParseInt(
		chi.URLParam(r, "conversationID"),
		10,
		64,
	)
	if err != nil || conversationID <= 0 {
		app.BadRequest(w, r, errors.New("invalid conversation ID"))
		return
	}

	var payload CreateMessagePayload
	if err := ReadJson(w, r, &payload); err != nil {
		app.BadRequest(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.BadRequest(w, r, err)
		return
	}

	if strings.TrimSpace(payload.Content) == "" {
		app.BadRequest(w, r, errors.New("message content cannot be empty"))
		return
	}

	user := getUserFromCtx(r)

	message := &store.Message{
		ConversationID: conversationID,
		SenderID:       user.ID,
		Content:        strings.TrimSpace(payload.Content),
	}

	if err := app.store.Messages.CreateMessage(r.Context(), message); err != nil {
		switch {
		case errors.Is(err, store.ErrBadRequest):
			app.BadRequest(w, r, err)
		case errors.Is(err, store.ErrNotFound):
			app.NotFound(w, r, err)
		default:
			app.InternalServerError(w, r, err)
		}
		return
	}

	message.Sender = *user

	if err := app.jsonResponse(w, http.StatusCreated, message); err != nil {
		app.InternalServerError(w, r, err)
	}
}
