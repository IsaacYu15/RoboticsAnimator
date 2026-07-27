package api

import (
	"context"
	"log/slog"
	"net/http"
	"time"
)

func (s *Server) handleHealthz(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	if err := s.pinger.Ping(ctx); err != nil {
		slog.Error("health check failed", "error", err)
		respondError(w, http.StatusServiceUnavailable, "database unreachable")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
