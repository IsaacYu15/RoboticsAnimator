.PHONY: build vet sqlc mod-tidy up down reset-db logs

build:
	go build ./...

vet:
	go vet ./...

mod-tidy:
	go mod tidy

# Regenerate internal/db from queries/ and migrations/ (requires sqlc:
# go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest)
sqlc:
	sqlc generate

up:
	docker compose -f ../compose.yaml up --build -d

down:
	docker compose -f ../compose.yaml down

reset-db:
	docker compose -f ../compose.yaml down -v

logs:
	docker compose -f ../compose.yaml logs -f goapp
