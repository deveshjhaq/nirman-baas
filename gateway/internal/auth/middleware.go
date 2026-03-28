package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"gateway/internal/cache"
)

func JWTAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Authorization header required"})
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid authorization format. Use: Bearer <token>"})
			return
		}

		claims, err := ValidateToken(parts[1])
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid or expired token"})
			return
		}

		ctx := context.WithValue(r.Context(), "user_id", claims.UserID)
		ctx = context.WithValue(ctx, "email", claims.Email)
		ctx = context.WithValue(ctx, "is_admin", claims.IsAdmin)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func APIKeyAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		apiKey := r.Header.Get("X-API-Key")
		if apiKey == "" {
			apiKey = r.URL.Query().Get("api_key")
		}

		if apiKey == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "API key required."})
			return
		}

		if !strings.HasPrefix(apiKey, "nk_") {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid API key format"})
			return
		}

		ctx := r.Context()
		data, err := ValidateAPIKey(ctx, apiKey)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid API key"})
			return
		}

		if !data.IsActive {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(map[string]string{"error": "API key is deactivated"})
			return
		}

		if data.ExpiresAt != nil && data.ExpiresAt.Before(time.Now()) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(map[string]string{"error": "API key has expired"})
			return
		}

		go TouchAPIKey(data.KeyID)

		rateLimitKey := fmt.Sprintf("ratelimit:apikey:%s", data.KeyID)
		allowed, err := cache.CheckRateLimit(ctx, rateLimitKey, data.RateLimitPerMin, time.Minute)
		if err != nil || !allowed {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"error":       "Rate limit exceeded",
				"limit":       data.RateLimitPerMin,
				"retry_after": "60s",
			})
			return
		}

		ctx = context.WithValue(ctx, "project_id", data.ProjectID)
		ctx = context.WithValue(ctx, "api_key_id", data.KeyID)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
