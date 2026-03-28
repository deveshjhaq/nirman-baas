package middleware

import (
	"context"
	"net/http"
	"time"

	chimiddleware "github.com/go-chi/chi/v5/middleware"
)

// Standard general-purpose HTTP middlewares
var (
	Logger    = chimiddleware.Logger
	Recoverer = chimiddleware.Recoverer
	RealIP    = chimiddleware.RealIP
	RequestID = chimiddleware.RequestID
)

// RequestTimeout sets a global hard timeout for request processing
func RequestTimeout(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
		defer cancel()
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
