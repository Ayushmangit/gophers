package main

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"strings"

	"github.com/Ayushmangit/social/internal/store"
	ws "github.com/Ayushmangit/social/internal/websocket"
	"github.com/coder/websocket"
)

// CreateWebSocketTicket godoc
//
//	@Summary		Create a WebSocket ticket
//	@Description	Creates a short-lived, single-use ticket for an authenticated WebSocket connection.
//	@Tags			messaging
//	@Produce		json
//	@Success		201	{object}	map[string]string	"WebSocket ticket created"
//	@Failure		401	{object}	error				"Unauthorized"
//	@Failure		500	{object}	error				"Internal server error"
//	@Security		ApiKeyAuth
//	@Router			/ws/ticket [post]
func (app *application) createWebSocketTicketHandler(w http.ResponseWriter, r *http.Request) {
	user := getUserFromCtx(r)
	if user == nil {
		app.UnAuthorized(w, r, nil)
		return
	}

	ticket, err := app.hub.IssueTicket(user.ID)
	if err != nil {
		app.InternalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, map[string]string{
		"ticket": ticket,
	}); err != nil {
		app.InternalServerError(w, r, err)
	}
}

// WebSocketConnection godoc
//
//	@Summary		Establish a WebSocket connection
//	@Description	Upgrades the HTTP connection to WebSocket using a short-lived, single-use ticket obtained from POST /ws/ticket.
//	@Tags			messaging
//	@Produce		json
//	@Param			ticket	query		string	true	"Single-use WebSocket ticket"
//	@Success		101		{string}	string	"Switching Protocols"
//	@Failure		401		{object}	error	"Invalid or expired ticket"
//	@Failure		403		{object}	error	"Origin not allowed"
//	@Router			/ws [get]
func (app *application) webSocketHandler(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("ticket")
	userID, err := app.hub.ConsumeTicket(token)
	if err != nil {
		http.Error(w, "invalid or expired websocket ticket", http.StatusUnauthorized)
		return
	}

	frontendURL, err := url.Parse(app.config.frontendURL)
	if err != nil || frontendURL.Host == "" {
		app.InternalServerError(w, r, errors.New("invalid frontend URL configuration"))
		return
	}

	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		OriginPatterns: []string{frontendURL.Host},
	})
	if err != nil {
		app.logger.Errorw("websocket connection failed", "error", err)
		return
	}
	defer conn.Close(websocket.StatusNormalClosure, "connection closed")

	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()

	client := ws.NewClient(userID, conn)

	app.hub.Register(client)
	defer app.hub.Unregister(client)

	go func() {
		_ = client.WritePump(ctx)
		cancel()
	}()

	_ = client.ReadPump(ctx, app.handleIncomingWebSocketMessage)
}

func (app *application) handleIncomingWebSocketMessage(
	ctx context.Context,
	client *ws.Client,
	data []byte,
) error {
	var incoming ws.IncomingMessage

	if err := json.Unmarshal(data, &incoming); err != nil {
		return err
	}

	incoming.Content = strings.TrimSpace(incoming.Content)

	if incoming.ConversationID <= 0 ||
		incoming.Content == "" ||
		len(incoming.Content) > 5000 {
		return store.ErrBadRequest
	}

	message := &store.Message{
		ConversationID: incoming.ConversationID,
		SenderID:       client.UserID,
		Content:        incoming.Content,
	}

	if err := app.store.Messages.CreateMessage(ctx, message); err != nil {
		return err
	}

	otherUserID, err := app.store.Messages.GetOtherParticipantID(
		ctx,
		message.ConversationID,
		client.UserID,
	)
	if err != nil {
		return err
	}

	outgoing := ws.OutgoingMessage{
		ID:             message.ID,
		ConversationID: message.ConversationID,
		SenderID:       message.SenderID,
		Content:        message.Content,
		CreatedAt:      message.CreatedAt,
	}

	payload, err := json.Marshal(outgoing)
	if err != nil {
		return err
	}

	app.hub.SendToUser(client.UserID, payload)
	app.hub.SendToUser(otherUserID, payload)

	return nil
}
