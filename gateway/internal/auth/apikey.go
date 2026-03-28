package auth

import (
	"context"
	"crypto/sha256"
	"fmt"
	"time"

	"gateway/internal/database"
)

type APIKeyData struct {
	KeyID           string
	ProjectID       string
	RateLimitPerMin int
	IsActive        bool
	ExpiresAt       *time.Time
}

func HashAPIKey(key string) string {
	h := sha256.Sum256([]byte(key))
	return fmt.Sprintf("%x", h[:])
}

func ValidateAPIKey(ctx context.Context, apiKey string) (*APIKeyData, error) {
	keyHash := HashAPIKey(apiKey)
	prefix := apiKey[:12]

	var data APIKeyData
	err := database.Pool.QueryRow(ctx, `
		SELECT id, project_id, rate_limit_per_min, is_active, expires_at
		FROM api_keys
		WHERE key_hash = $1 AND key_prefix = $2
	`, keyHash, prefix).Scan(&data.KeyID, &data.ProjectID, &data.RateLimitPerMin, &data.IsActive, &data.ExpiresAt)

	if err != nil {
		return nil, err
	}

	return &data, nil
}

func TouchAPIKey(keyID string) {
	// Fire and forget updating last_used_at
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	database.Pool.Exec(ctx, `UPDATE api_keys SET last_used_at = NOW() WHERE id = $1`, keyID)
}
