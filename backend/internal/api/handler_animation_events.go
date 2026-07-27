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

func (s *Server) handleGetAnimationEvents(w http.ResponseWriter, r *http.Request) {
	events, err := s.queries.GetAnimationEvents(r.Context())
	if err != nil {
		slog.Error("get animation events", "error", err)
		respondError(w, http.StatusInternalServerError, "failed to get animation events")
		return
	}
	respondJSON(w, http.StatusOK, events)
}

func (s *Server) handleGetAnimationEvent(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid id")
		return
	}

	event, err := s.queries.GetAnimationEvent(r.Context(), int32(id))
	if err != nil {
		respondError(w, http.StatusNotFound, "animation event not found")
		return
	}
	respondJSON(w, http.StatusOK, event)
}

type createAnimationEventRequest struct {
	AnimationID int32   `json:"animation_id"`
	ComponentID int32   `json:"component_id"`
	TriggerTime float64 `json:"trigger_time"`
	Action      string  `json:"action"`
	Easing      *string `json:"easing"`
}

func (s *Server) handleCreateAnimationEvent(w http.ResponseWriter, r *http.Request) {
	var req createAnimationEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	req.Action = strings.TrimSpace(req.Action)
	if req.Action == "" {
		respondError(w, http.StatusBadRequest, "action is required")
		return
	}

	event, err := s.queries.CreateAnimationEvent(r.Context(), db.CreateAnimationEventParams{
		AnimationID: req.AnimationID,
		ComponentID: req.ComponentID,
		TriggerTime: req.TriggerTime,
		Action:      req.Action,
		Easing:      toPgText(req.Easing),
	})

	if err != nil {
		slog.Error("create animation event", "error", err)
		respondError(w, http.StatusInternalServerError, "failed to create animation event")
		return
	}
	respondJSON(w, http.StatusCreated, event)
}

func (s *Server) handleDeleteAnimationEvent(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)

	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid id")
		return
	}

	rows, err := s.queries.DeleteAnimationEvent(r.Context(), int32(id))
	if err != nil {
		respondError(w, http.StatusBadRequest, "failed to delete animation event")
		return
	}
	if rows == 0 {
		respondError(w, http.StatusNotFound, "animation event not found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

type updateAnimationEventRequest struct {
	AnimationID *int     `json:"animation_id"`
	ComponentID *int     `json:"component_id"`
	TriggerTime *float64 `json:"trigger_time"`
	Action      *string  `json:"action"`
	Easing      *string  `json:"easing"`
}

func (s *Server) handleUpdateAnimationEvent(w http.ResponseWriter, r *http.Request) {
	idstr := r.PathValue("id")
	id, err := strconv.Atoi(idstr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid id")
		return
	}

	var req updateAnimationEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	event, err := s.queries.UpdateAnimationEvent(r.Context(), db.UpdateAnimationEventParams{
		ID:          int32(id),
		AnimationID: toPgInt4(req.AnimationID),
		ComponentID: toPgInt4(req.ComponentID),
		TriggerTime: toPgFloat8(req.TriggerTime),
		Action:      toPgText(req.Action),
		Easing:      toPgText(req.Easing),
	})

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			respondError(w, http.StatusNotFound, "animation event not found")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to update animation event")
		return
	}

	respondJSON(w, http.StatusOK, event)
}
