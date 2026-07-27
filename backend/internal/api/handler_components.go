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

func (s *Server) handleGetComponents(w http.ResponseWriter, r *http.Request) {
	includes := r.URL.Query().Get("include")

	if includes == "animation_events" {
		components, err := s.queries.GetComponentsWithAnimations(r.Context())
		if err != nil {
			slog.Error("get components with animations", "error", err)
			respondError(w, http.StatusInternalServerError, "failed to get components with animations")
			return
		}
		respondJSON(w, http.StatusOK, components)
		return
	}

	components, err := s.queries.GetComponents(r.Context())
	if err != nil {
		slog.Error("get components", "error", err)
		respondError(w, http.StatusInternalServerError, "failed to get components")
		return
	}
	respondJSON(w, http.StatusOK, components)
}

func (s *Server) handleGetComponent(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid id")
		return
	}

	component, err := s.queries.GetComponent(r.Context(), int32(id))
	if err != nil {
		respondError(w, http.StatusNotFound, "component not found")
		return
	}
	respondJSON(w, http.StatusOK, component)
}

type createComponentRequest struct {
	Name   string           `json:"name"`
	Type   string           `json:"type"`
	Pin    int              `json:"pin"`
	Colour *string          `json:"colour"`
	Config *json.RawMessage `json:"config"`
}

func (s *Server) handleCreateComponent(w http.ResponseWriter, r *http.Request) {
	var req createComponentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Type = strings.TrimSpace(req.Type)
	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "name is required")
		return
	}
	if req.Type == "" {
		respondError(w, http.StatusBadRequest, "type is required")
		return
	}

	component, err := s.queries.CreateComponent(r.Context(), db.CreateComponentParams{
		Name:   req.Name,
		Type:   req.Type,
		Pin:    toPgInt4(&req.Pin),
		Colour: toPgText(req.Colour),
		Config: toPgJSONB(req.Config),
	})

	if err != nil {
		slog.Error("create component", "error", err)
		respondError(w, http.StatusInternalServerError, "failed to create component")
		return
	}
	respondJSON(w, http.StatusCreated, component)
}

func (s *Server) handleDeleteComponent(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)

	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid id")
		return
	}

	rows, err := s.queries.DeleteComponent(r.Context(), int32(id))
	if err != nil {
		respondError(w, http.StatusBadRequest, "failed to delete component")
		return
	}
	if rows == 0 {
		respondError(w, http.StatusNotFound, "component not found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

type updateComponentRequest struct {
	Name   *string          `json:"name"`
	Type   *string          `json:"type"`
	Pin    *int             `json:"pin"`
	X      *float64         `json:"x"`
	Y      *float64         `json:"y"`
	Z      *float64         `json:"z"`
	RotX   *float64         `json:"rot_x"`
	RotY   *float64         `json:"rot_y"`
	RotZ   *float64         `json:"rot_z"`
	Colour *string          `json:"colour"`
	Config *json.RawMessage `json:"config"`
}

func (s *Server) handleUpdateComponent(w http.ResponseWriter, r *http.Request) {
	idstr := r.PathValue("id")
	id, err := strconv.Atoi(idstr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid id")
		return
	}

	var req updateComponentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	component, err := s.queries.UpdateComponent(r.Context(), db.UpdateComponentParams{
		ID:     int32(id),
		Name:   toPgText(req.Name),
		Type:   toPgText(req.Type),
		Pin:    toPgInt4(req.Pin),
		X:      toPgFloat8(req.X),
		Y:      toPgFloat8(req.Y),
		Z:      toPgFloat8(req.Z),
		RotX:   toPgFloat8(req.RotX),
		RotY:   toPgFloat8(req.RotY),
		RotZ:   toPgFloat8(req.RotZ),
		Colour: toPgText(req.Colour),
		Config: toPgJSONB(req.Config),
	})

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			respondError(w, http.StatusNotFound, "component not found")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to update component")
		return
	}

	respondJSON(w, http.StatusOK, component)
}
