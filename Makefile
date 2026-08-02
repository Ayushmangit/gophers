include .envrc

MIGRATIONS_PATH := ./cmd/migrate/migrations

.PHONY: migrate-up 
migrate-up:
	@goose -dir $(MIGRATIONS_PATH) up

.PHONY: migrate-down
migrate-down:
	@goose -dir $(MIGRATIONS_PATH) down

.PHONY: migrate-status
migrate-status:
	@goose -dir $(MIGRATIONS_PATH) status

.PHONY: migrate-create
migrate-create:
	@read -p "Migration name: " name; \
	@goose -dir $(MIGRATIONS_PATH) create $$name sql
