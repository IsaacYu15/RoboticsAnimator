# Backend

Go HTTP API backed by Postgres. Runs via Docker Compose (see `../compose.yaml`).

## Project layout

```
cmd/api/            Entrypoint: wiring, HTTP server, graceful shutdown
internal/api/       HTTP layer: handlers, routing, middleware
internal/config/    Environment-based configuration
internal/database/  pgxpool connection + migration runner
internal/db/        sqlc-generated query code (DO NOT EDIT by hand)
migrations/         SQL migrations (embedded into the binary at build time)
queries/            SQL queries that sqlc compiles into internal/db
```

Rule of thumb: `cmd/` only wires things together; `internal/` holds all logic
and cannot be imported by other modules (enforced by the Go toolchain).

## Running

From the repo root (`animator/`):

```bash
cp .env.example .env    # first time only
docker compose up --build -d
```

Or from `backend/` using the Makefile:

```bash
make up
```

The API is then available at `http://localhost:8000`.

```bash
curl http://localhost:8000/healthz
curl http://localhost:8000/api/v1/users
curl -X POST http://localhost:8000/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com"}'
```

## Configuration

Copy `.env.example` to `.env` next to `compose.yaml`. Compose substitutes
`${VAR}` from that file automatically.

| Variable              | Required | Default                 | Description                     |
| --------------------- | -------- | ----------------------- | ------------------------------- |
| `POSTGRES_USER`       | yes      | —                       | Postgres username               |
| `POSTGRES_PASSWORD`   | yes      | —                       | Postgres password               |
| `POSTGRES_DB`         | yes      | —                       | Postgres database name          |
| `PORT`                | no       | `8000`                  | HTTP listen port                |
| `CORS_ALLOWED_ORIGIN` | no       | `http://localhost:3000` | Frontend origin allowed by CORS |

The `goapp` service also receives `DATABASE_URL`, built from the Postgres
variables above.

## API

All responses are JSON. Errors always have the shape `{"error": "message"}`.

| Method | Path            | Description                                    |
| ------ | --------------- | ---------------------------------------------- |
| `GET`  | `/healthz`      | Liveness/readiness — pings the database        |
| `GET`  | `/api/v1/users` | List users                                     |
| `POST` | `/api/v1/users` | Create a user (`{"name":"...","email":"..."}`) |

`POST /api/v1/users` returns `201` on success, `400` on validation failure,
and `409` when the email is already taken.

## Docker

The backend uses a multi-stage `Dockerfile`:

1. **Build stage** — `golang:1.26` image; module files are copied first so
   `go mod download` stays cached across source edits.
2. **Runtime stage** — `gcr.io/distroless/static-debian12:nonroot` (~15 MB);
   runs as an unprivileged user with no shell. Migrations are embedded in the
   binary at build time.

`.dockerignore` keeps `.git`, docs, and local artifacts out of the build
context for faster, smaller builds.

## Makefile

Run from `backend/`:

| Target          | Description                                    |
| --------------- | ---------------------------------------------- |
| `make build`    | Compile all packages                           |
| `make vet`      | Run `go vet`                                   |
| `make mod-tidy` | Sync `go.mod` / `go.sum`                       |
| `make sqlc`     | Regenerate `internal/db` from SQL              |
| `make up`       | Start the full stack via Compose               |
| `make down`     | Stop containers                                |
| `make reset-db` | Stop containers and delete the Postgres volume |
| `make logs`     | Tail the `goapp` service logs                  |

## Development workflow

Adding a feature that touches the database:

1. Add a migration: `migrations/00000N_description.up.sql` + matching
   `.down.sql`. Never edit a migration that has already been applied — always
   add a new one.
2. Write the query in `queries/*.sql` with a sqlc annotation
   (`-- name: GetThing :one`).
3. Regenerate the type-safe code: `make sqlc`
   (install: `go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest`).
4. Add a handler in `internal/api/handlers.go` and register the route in
   `internal/api/router.go`.
5. Rebuild the stack: `make up`. Migrations apply automatically on startup.

To reset the local database completely (drops all data):

```bash
make reset-db
```

## Checks

```bash
make build
make vet
```

migrate create -ext sql -dir migrations -seq your_migration_name

migrate -path ./migrations -database "postgres://postgres:postgres@localhost:5433/postgres?sslmode=disable" up
