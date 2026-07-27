-- name: GetAnimations :many
SELECT * FROM animations;

-- name: CreateAnimation :one
INSERT INTO animations (name)
VALUES ($1)
RETURNING *;

-- name: GetAnimation :one
SELECT id, name FROM animations
WHERE id = $1;

-- name: DeleteAnimation :execrows
DELETE FROM animations
WHERE id = $1;

-- name: UpdateAnimation :one
UPDATE animations
SET 
    name = COALESCE(sqlc.narg('name'), name)
WHERE id = sqlc.arg('id')
RETURNING *;
