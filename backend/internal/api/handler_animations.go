package api

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strconv"
	"strings"

	"github.com/IsaacYu15/robotics-animator/backend/internal/db"
)

func (s *Server) handleGetAnimations(w http.ResponseWriter, r *http.Request) {
	animations, err := s.queries.GetAnimations(r.Context())
	if err != nil {
		slog.Error("get animations", "error", err)
		respondError(w, http.StatusInternalServerError, "failed to get animations")
		return
	}
	respondJSON(w, http.StatusOK, animations)
}

func (s *Server) handleGetAnimation(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid id")
		return
	}

	animation, err := s.queries.GetAnimation(r.Context(), int32(id))
	if err != nil {
		respondError(w, http.StatusNotFound, "animation not found")
		return
	}
	respondJSON(w, http.StatusOK, animation)
}

type createAnimationRequest struct {
	Name string `json:"name"`
}

func (s *Server) handleCreateAnimation(w http.ResponseWriter, r *http.Request) {
	var req createAnimationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "name is required")
		return
	}

	animation, err := s.queries.CreateAnimation(r.Context(), req.Name)

	if err != nil {
		slog.Error("create animation", "error", err)
		respondError(w, http.StatusInternalServerError, "failed to create animation")
		return
	}
	respondJSON(w, http.StatusCreated, animation)
}

func (s *Server) handleDeleteAnimation(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)

	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid id")
		return
	}

	rows, err := s.queries.DeleteAnimation(r.Context(), int32(id))
	if err != nil {
		respondError(w, http.StatusBadRequest, "failed to delete animation")
		return
	}
	if rows == 0 {
		respondError(w, http.StatusNotFound, "animation not found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

type updateAnimationRequest struct {
	Name *string `json:"name"`
}

func (s *Server) handleUpdateAnimation(w http.ResponseWriter, r *http.Request) {
	idstr := r.PathValue("id")
	id, err := strconv.Atoi(idstr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid id")
		return
	}

	var req updateAnimationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	animation, err := s.queries.UpdateAnimation(r.Context(), db.UpdateAnimationParams{
		ID:   int32(id),
		Name: toPgText(req.Name),
	})

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			respondError(w, http.StatusNotFound, "animation not found")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to update animation")
		return
	}

	respondJSON(w, http.StatusOK, animation)
}
