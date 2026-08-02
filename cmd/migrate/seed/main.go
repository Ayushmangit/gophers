package main

import (
	"log"

	"github.com/Ayushmangit/social/internal/db"
	"github.com/Ayushmangit/social/internal/env"
	"github.com/Ayushmangit/social/internal/store"
)

func main() {
	addr := env.GetString("DB_ADDR", "postgres://admin:adminpassword@localhost/social?sslmode=disable")
	conn, err := db.New(addr, 3, 3, "15m")
	if err != nil {
		log.Fatal(err)
		return
	}
	store := store.NewStorage(conn)
	db.Seed(store, conn)
}
