package api

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5/pgconn"

	"github.com/IsaacYu15/robotics-animator/backend/internal/db"
)

func (s *Server) handleGetModules(w http.ResponseWriter, r *http.Request) {
	modules, err := s.queries.GetModules(r.Context())
	if err != nil {
		slog.Error("get modules", "error", err)
		respondError(w, http.StatusInternalServerError, "failed to get modules")
		return
	}
	respondJSON(w, http.StatusOK, modules)
}

func (s *Server) handleGetModule(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid id")
		return
	}

	module, err := s.queries.GetModule(r.Context(), int32(id))
	if err != nil {
		respondError(w, http.StatusNotFound, "module not found")
		return
	}
	respondJSON(w, http.StatusOK, module)
}

type createModuleRequest struct {
	Address string `json:"address"`
	Type    string `json:"type"`
	Name    string `json:"name"`
}

func (s *Server) handleCreateModule(w http.ResponseWriter, r *http.Request) {
	var req createModuleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	req.Address = strings.TrimSpace(req.Address)
	req.Name = strings.TrimSpace(req.Name)
	req.Type = strings.TrimSpace(req.Type)
	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "name is required")
		return
	}
	if req.Address == "" {
		respondError(w, http.StatusBadRequest, "address is required")
		return
	}
	if req.Type == "" {
		respondError(w, http.StatusBadRequest, "type is required")
		return
	}

	module, err := s.queries.CreateModule(r.Context(), db.CreateModuleParams{
		Name:    req.Name,
		Type:    req.Type,
		Address: req.Address,
	})

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			respondError(w, http.StatusConflict, fmt.Sprintf("a module with name %s already exists", req.Name))
			return
		}
		slog.Error("create module", "error", err)
		respondError(w, http.StatusInternalServerError, "failed to create module")
		return
	}
	respondJSON(w, http.StatusCreated, module)
}

func (s *Server) handleDeleteModule(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)

	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid id")
		return
	}

	rows, err := s.queries.DeleteModule(r.Context(), int32(id))
	if err != nil {
		respondError(w, http.StatusBadRequest, "failed to delete module")
		return
	}
	if rows == 0 {
		respondError(w, http.StatusNotFound, "module not found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

type updateModuleRequest struct {
	Address *string `json:"address"`
	Type    *string `json:"type"`
	Name    *string `json:"name"`
}

func (s *Server) handleUpdateModule(w http.ResponseWriter, r *http.Request) {
	idstr := r.PathValue("id")
	id, err := strconv.Atoi(idstr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid id")
		return
	}

	var req updateModuleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	module, err := s.queries.UpdateModule(r.Context(), db.UpdateModuleParams{
		ID:      int32(id),
		Name:    toPgText(req.Name),
		Type:    toPgText(req.Type),
		Address: toPgText(req.Address),
	})

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			respondError(w, http.StatusConflict, fmt.Sprintf("a module with name %s already exists", *req.Name))
			return
		}
		if errors.Is(err, sql.ErrNoRows) {
			respondError(w, http.StatusNotFound, "module not found")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to update module")
		return
	}

	respondJSON(w, http.StatusOK, module)
}
