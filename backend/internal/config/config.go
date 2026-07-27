package config

import (
	"errors"
	"os"
)

type Config struct {
	DatabaseURL       string // Required
	Port              string // Optional
	CORSAllowedOrigin string // Optional
}

func Load() (Config, error) {
	cfg := Config{
		DatabaseURL:       os.Getenv("DATABASE_URL"),
		Port:              envOr("PORT", "8000"),
		CORSAllowedOrigin: envOr("CORS_ALLOWED_ORIGIN", "http://localhost:3000"),
	}
	if cfg.DatabaseURL == "" {
		return Config{}, errors.New("DATABASE_URL environment variable is required")
	}
	return cfg, nil
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
