package websocket

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"sync"
	"time"
)

type Hub struct {
	mu      sync.RWMutex
	clients map[int64]map[*Client]struct{}
	tickets map[string]ticket
}

func NewHub() *Hub {
	return &Hub{
		clients: make(map[int64]map[*Client]struct{}),
		tickets: make(map[string]ticket),
	}
}

func (h *Hub) Register(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.clients[client.UserID] == nil {
		h.clients[client.UserID] = make(map[*Client]struct{})
	}

	h.clients[client.UserID][client] = struct{}{}
}

func (h *Hub) Unregister(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	userClients, exists := h.clients[client.UserID]
	if !exists {
		return
	}

	if _, exists := userClients[client]; !exists {
		return
	}

	delete(userClients, client)
	close(client.Send)

	if len(userClients) == 0 {
		delete(h.clients, client.UserID)
	}
}

func (h *Hub) SendToUser(userID int64, message []byte) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()

	userClients := h.clients[userID]
	if len(userClients) == 0 {
		return false
	}

	delivered := false

	for client := range userClients {
		select {
		case client.Send <- message:
			delivered = true
		default:
			// The client's send queue is full.
			// Do not block other users.
		}
	}

	return delivered
}

type ticket struct {
	UserID    int64
	ExpiresAt time.Time
}

var ErrInvalidTicket = errors.New("invalid or expired websocket ticket")

func (h *Hub) IssueTicket(userID int64) (string, error) {
	if userID <= 0 {
		return "", ErrInvalidTicket
	}

	randomBytes := make([]byte, 32)
	if _, err := rand.Read(randomBytes); err != nil {
		return "", err
	}

	token := hex.EncodeToString(randomBytes)

	h.mu.Lock()
	defer h.mu.Unlock()

	if h.tickets == nil {
		h.tickets = make(map[string]ticket)
	}

	now := time.Now()

	for key, value := range h.tickets {
		if now.After(value.ExpiresAt) {
			delete(h.tickets, key)
		}
	}

	h.tickets[token] = ticket{
		UserID:    userID,
		ExpiresAt: now.Add(30 * time.Second),
	}

	return token, nil
}

func (h *Hub) ConsumeTicket(token string) (int64, error) {
	h.mu.Lock()
	defer h.mu.Unlock()

	value, exists := h.tickets[token]
	if !exists {
		return 0, ErrInvalidTicket
	}

	delete(h.tickets, token)

	if time.Now().After(value.ExpiresAt) {
		return 0, ErrInvalidTicket
	}

	return value.UserID, nil
}
