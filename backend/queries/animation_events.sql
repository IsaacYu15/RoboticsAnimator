-- name: GetAnimationEvents :many
SELECT * FROM animation_events
ORDER BY trigger_time ASC;

-- name: GetAnimationEventsByAnimation :many
SELECT * FROM animation_events
WHERE animation_id = $1
ORDER BY trigger_time ASC;

-- name: GetAnimationEvent :one
SELECT * FROM animation_events
WHERE id = $1;

-- name: CreateAnimationEvent :one
INSERT INTO animation_events (animation_id, component_id, trigger_time, action, easing)
VALUES (
    $1,
    $2,
    $3,
    $4,
    COALESCE(sqlc.narg('easing'), '0,0,1,1')
)
RETURNING *;

-- name: UpdateAnimationEvent :one
UPDATE animation_events
SET
    animation_id  = COALESCE(sqlc.narg('animation_id'), animation_id),
    component_id  = COALESCE(sqlc.narg('component_id'), component_id),
    trigger_time  = COALESCE(sqlc.narg('trigger_time'), trigger_time),
    action        = COALESCE(sqlc.narg('action'), action),
    easing        = COALESCE(sqlc.narg('easing'), easing)
WHERE id = sqlc.arg('id')
RETURNING *;

-- name: DeleteAnimationEvent :execrows
DELETE FROM animation_events
WHERE id = $1;