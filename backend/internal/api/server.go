package api

import (
	"context"

	"github.com/IsaacYu15/robotics-animator/backend/internal/db"
)

type Pinger interface {
	Ping(ctx context.Context) error
}

type Server struct {
	queries db.Querier
	pinger  Pinger
}

func NewServer(queries db.Querier, pinger Pinger) *Server {
	return &Server{queries: queries, pinger: pinger}
}
