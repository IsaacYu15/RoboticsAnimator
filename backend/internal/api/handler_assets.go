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

func (s *Server) handleGetAssets(w http.ResponseWriter, r *http.Request) {
	assets, err := s.queries.GetAssets(r.Context())
	if err != nil {
		slog.Error("get assets", "error", err)
		respondError(
			w,
			http.StatusInternalServerError,
			"failed to get assets",
		)
		return
	}

	respondJSON(w, http.StatusOK, assets)
}

func (s *Server) handleGetAsset(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid id")
		return
	}

	asset, err := s.queries.GetAsset(
		r.Context(),
		int32(id),
	)

	if err != nil {
		respondError(w, http.StatusNotFound, "asset not found")
		return
	}

	respondJSON(w, http.StatusOK, asset)
}

type createAssetRequest struct {
	Type   string          `json:"type"`
	Name   string          `json:"name"`
	Colour string          `json:"colour"`
	Config json.RawMessage `json:"config"`
}

func (s *Server) handleCreateAsset(
	w http.ResponseWriter,
	r *http.Request,
) {
	var req createAssetRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	asset, err := s.queries.CreateAsset(
		r.Context(),
		db.CreateAssetParams{
			Type:   req.Type,
			Name:   req.Name,
			Colour: req.Colour,
			Config: req.Config,
		},
	)

	if err != nil {
		var pgErr *pgconn.PgError

		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			respondError(
				w,
				http.StatusConflict,
				fmt.Sprintf(
					"asset %s already exists",
					req.Name,
				),
			)
			return
		}

		slog.Error("create asset", "error", err)

		respondError(
			w,
			http.StatusInternalServerError,
			"failed to create asset",
		)
		return
	}

	respondJSON(
		w,
		http.StatusCreated,
		asset,
	)
}

func (s *Server) handleDeleteAsset(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid id")
		return
	}

	rows, err := s.queries.DeleteAsset(
		r.Context(),
		int32(id),
	)

	if err != nil {
		respondError(
			w,
			http.StatusInternalServerError,
			"failed to delete asset",
		)
		return
	}

	if rows == 0 {
		respondError(
			w,
			http.StatusNotFound,
			"asset not found",
		)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

type updateAssetRequest struct {
	Type   *string          `json:"type"`
	Name   *string          `json:"name"`
	Colour *string          `json:"colour"`
	Config *json.RawMessage `json:"config"`
}

func (s *Server) handleUpdateAsset(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid id")
		return
	}

	var req updateAssetRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	asset, err := s.queries.UpdateAsset(
		r.Context(),
		db.UpdateAssetParams{
			ID:     int32(id),
			Type:   toPgText(req.Type),
			Name:   toPgText(req.Name),
			Colour: toPgText(req.Colour),
			Config: toPgJSONB(req.Config),
		},
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			respondError(
				w,
				http.StatusNotFound,
				"asset not found",
			)
			return
		}

		slog.Error("update asset", "error", err)

		respondError(
			w,
			http.StatusInternalServerError,
			"failed to update asset",
		)
		return
	}

	respondJSON(
		w,
		http.StatusOK,
		asset,
	)
}
