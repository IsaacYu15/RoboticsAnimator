-- name: GetModules :many
SELECT * FROM modules;

-- name: CreateModule :one
INSERT INTO modules (address, type, name)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetModule :one
SELECT id, type, address, name FROM modules
WHERE id = $1;

-- name: DeleteModule :execrows
DELETE FROM modules
WHERE id = $1;

-- name: UpdateModule :one
UPDATE modules
SET 
    name = COALESCE(sqlc.narg('name'), name),
    "type" = COALESCE(sqlc.narg('type'), type),
    address = COALESCE(sqlc.narg('address'), address)
WHERE id = sqlc.arg('id')
RETURNING *;
    