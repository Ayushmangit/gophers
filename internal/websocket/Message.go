package websocket

type IncomingMessage struct {
	ConversationID int64  `json:"conversation_id"`
	Content        string `json:"content"`
}

type OutgoingMessage struct {
	ID             int64  `json:"id"`
	ConversationID int64  `json:"conversation_id"`
	SenderID       int64  `json:"sender_id"`
	Content        string `json:"content"`
	CreatedAt      string `json:"created_at"`
}
