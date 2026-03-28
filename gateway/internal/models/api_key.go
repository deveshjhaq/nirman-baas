package models

import "time"

type APIKey struct {
	ID              string     `json:"id"`
	ProjectID       string     `json:"project_id"`
	KeyHash         string     `json:"-"`
	KeyPrefix       string     `json:"key_prefix"`
	Name            string     `json:"name"`
	Scopes          []string   `json:"scopes"`
	RateLimitPerMin int        `json:"rate_limit_per_min"`
	IsActive        bool       `json:"is_active"`
	LastUsedAt      *time.Time `json:"last_used_at"`
	ExpiresAt       *time.Time `json:"expires_at"`
	CreatedAt       time.Time  `json:"created_at"`
}

type CreateAPIKeyRequest struct {
	Name            string   `json:"name"`
	Scopes          []string `json:"scopes"`
	RateLimitPerMin int      `json:"rate_limit_per_min"`
}

type APIKeyResponse struct {
	APIKey
	RawKey string `json:"raw_key"`
}
