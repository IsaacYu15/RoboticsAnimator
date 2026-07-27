-- name: GetAssets :many
SELECT * FROM assets
ORDER BY id;

-- name: GetAsset :one
SELECT *
FROM assets
WHERE id = $1;

-- name: CreateAsset :one
INSERT INTO assets (
    type,
    name,
    colour,
    config
)
VALUES (
    $1,
    $2,
    $3,
    $4
)
RETURNING *;

-- name: DeleteAsset :execrows
DELETE FROM assets
WHERE id = $1;

-- name: UpdateAsset :one
UPDATE assets
SET
    type = COALESCE(sqlc.narg('type'), type),
    name = COALESCE(sqlc.narg('name'), name),
    colour = COALESCE(sqlc.narg('colour'), colour),
    config = COALESCE(sqlc.narg('config'), config)
WHERE id = sqlc.arg('id')
RETURNING *;