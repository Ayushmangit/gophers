package websocket

import (
	"context"

	"github.com/coder/websocket"
)

type Client struct {
	UserID int64
	Conn   *websocket.Conn
	Send   chan []byte
}

func NewClient(userID int64, conn *websocket.Conn) *Client {
	return &Client{
		UserID: userID,
		Conn:   conn,
		Send:   make(chan []byte, 32),
	}
}

func (c *Client) ReadPump(
	ctx context.Context,
	handleMessage func(context.Context, *Client, []byte) error,
) error {
	for {
		_, data, err := c.Conn.Read(ctx)
		if err != nil {
			return err
		}

		if err := handleMessage(ctx, c, data); err != nil {
			// Invalid messages should not terminate the connection.
			continue
		}
	}
}

func (c *Client) WritePump(ctx context.Context) error {
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()

		case message, ok := <-c.Send:
			if !ok {
				return nil
			}

			if err := c.Conn.Write(ctx, websocket.MessageText, message); err != nil {
				return err
			}
		}
	}
}
