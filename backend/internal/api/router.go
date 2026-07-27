package api

import "net/http"

func (s *Server) Routes(corsAllowedOrigin string) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/v1/healthz", s.handleHealthz)

	// modules
	mux.HandleFunc("GET /api/v1/modules/{id}", s.handleGetModule)
	mux.HandleFunc("GET /api/v1/modules", s.handleGetModules)
	mux.HandleFunc("POST /api/v1/modules", s.handleCreateModule)
	mux.HandleFunc("DELETE /api/v1/modules/{id}", s.handleDeleteModule)
	mux.HandleFunc("PATCH /api/v1/modules/{id}", s.handleUpdateModule)

	//components
	mux.HandleFunc("GET /api/v1/components/{id}", s.handleGetComponent)
	mux.HandleFunc("GET /api/v1/components", s.handleGetComponents)
	mux.HandleFunc("POST /api/v1/components", s.handleCreateComponent)
	mux.HandleFunc("DELETE /api/v1/components/{id}", s.handleDeleteComponent)
	mux.HandleFunc("PATCH /api/v1/components/{id}", s.handleUpdateComponent)

	// animations
	mux.HandleFunc("GET /api/v1/animations/{id}", s.handleGetAnimation)
	mux.HandleFunc("GET /api/v1/animations", s.handleGetAnimations)
	mux.HandleFunc("POST /api/v1/animations", s.handleCreateAnimation)
	mux.HandleFunc("DELETE /api/v1/animations/{id}", s.handleDeleteAnimation)
	mux.HandleFunc("PATCH /api/v1/animations/{id}", s.handleUpdateAnimation)

	//animation events
	mux.HandleFunc("GET /api/v1/animation-events/{id}", s.handleGetAnimationEvent)
	mux.HandleFunc("GET /api/v1/animation-events", s.handleGetAnimationEvents)
	mux.HandleFunc("POST /api/v1/animation-events", s.handleCreateAnimationEvent)
	mux.HandleFunc("DELETE /api/v1/animation-events/{id}", s.handleDeleteAnimationEvent)
	mux.HandleFunc("PATCH /api/v1/animation-events/{id}", s.handleUpdateAnimationEvent)

	// assets
	mux.HandleFunc("GET /api/v1/assets/{id}", s.handleGetAsset)
	mux.HandleFunc("GET /api/v1/assets", s.handleGetAssets)
	mux.HandleFunc("POST /api/v1/assets", s.handleCreateAsset)
	mux.HandleFunc("DELETE /api/v1/assets/{id}", s.handleDeleteAsset)
	mux.HandleFunc("PATCH /api/v1/assets/{id}", s.handleUpdateAsset)

	var handler http.Handler = mux
	handler = corsMiddleware(handler, corsAllowedOrigin)
	handler = loggingMiddleware(handler)
	return handler
}
