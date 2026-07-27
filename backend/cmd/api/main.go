package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/IsaacYu15/robotics-animator/backend/internal/api"
	"github.com/IsaacYu15/robotics-animator/backend/internal/config"
	"github.com/IsaacYu15/robotics-animator/backend/internal/database"
	"github.com/IsaacYu15/robotics-animator/backend/internal/db"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))

	if err := run(); err != nil {
		slog.Error("server exited with error", "error", err)
		os.Exit(1)
	}
}

func run() error {
	// shutdown listener
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	// config
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	// migrations
	if err := database.Migrate(cfg.DatabaseURL); err != nil {
		return err
	}
	slog.Info("migrations applied")

	// database connection
	pool, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		return err
	}
	defer pool.Close()

	// web server
	server := api.NewServer(db.New(pool), pool)
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      server.Routes(cfg.CORSAllowedOrigin),
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// error channel and background worker
	errCh := make(chan error, 1)
	go func() {
		slog.Info("server listening", "addr", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
	}()

	// wait for error or shutdown
	select {
	case err := <-errCh:
		return err
	case <-ctx.Done():
	}

	// shutdown
	slog.Info("shutting down")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	return srv.Shutdown(shutdownCtx)
}
