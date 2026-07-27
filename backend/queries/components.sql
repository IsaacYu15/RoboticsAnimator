-- name: GetComponents :many
SELECT * FROM components;

-- name: GetComponent :one
SELECT * FROM components
WHERE id = $1;

-- name: GetComponentsWithAnimations :many
SELECT
  c.id,
  c.type,
  c.pin,
  c.x,
  c.y,
  c.z,
  c.name,
  c.rot_x,
  c.rot_y,
  c.rot_z,
  c.colour,
  c.config,
  COALESCE(
      jsonb_agg(to_jsonb(ae)) FILTER (WHERE ae.id IS NOT NULL),
      '[]'::jsonb
  )::jsonb AS animation_events
FROM components c
LEFT JOIN animation_events ae ON ae.component_id = c.id
GROUP BY c.id
ORDER BY c.id;

-- name: CreateComponent :one
INSERT INTO components (
    type,
    pin,
    name,
    colour,
    config
)
VALUES (
    $1,
    $2,
    $3,
    $4,
    $5
)
RETURNING *;

-- name: UpdateComponent :one
UPDATE components
SET
    type   = COALESCE(sqlc.narg('type'), type),
    pin    = COALESCE(sqlc.narg('pin'), pin),
    x      = COALESCE(sqlc.narg('x'), x),
    y      = COALESCE(sqlc.narg('y'), y),
    z      = COALESCE(sqlc.narg('z'), z),
    name   = COALESCE(sqlc.narg('name'), name),
    rot_x  = COALESCE(sqlc.narg('rot_x'), rot_x),
    rot_y  = COALESCE(sqlc.narg('rot_y'), rot_y),
    rot_z  = COALESCE(sqlc.narg('rot_z'), rot_z),
    colour = COALESCE(sqlc.narg('colour'), colour),
    config = COALESCE(sqlc.narg('config'), config)
WHERE id = sqlc.arg('id')
RETURNING *;

-- name: DeleteComponent :execrows
DELETE FROM components
WHERE id = $1;