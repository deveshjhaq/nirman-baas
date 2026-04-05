package router

import (
	"net/http"
	"strings"

	"gateway/internal/auth"
	"gateway/internal/handlers"
	"gateway/internal/middleware"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

func New() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestTimeout)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-API-Key"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		handlers.RespondJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	// OAuth Routes
	r.Route("/oauth", func(r chi.Router) {
		r.Get("/google", auth.GoogleLoginStub)
		r.Get("/github", auth.GithubLoginStub)
		r.Get("/apple", auth.AppleLoginStub)
	})

	// Public Auth Routes
	r.Route("/auth", func(r chi.Router) {
		r.Post("/register", handlers.Register)
		r.Post("/login", handlers.Login)
	})

	// Admin Dashboard Protected Routes (JWT)
	r.Group(func(r chi.Router) {
		r.Use(auth.JWTAuth)
		r.Get("/profile", handlers.GetProfile)

		r.Route("/projects", func(r chi.Router) {
			r.Get("/{id}", handlers.GetProject)

			r.Route("/{id}/db", func(r chi.Router) {
				r.Post("/", handlers.SetupCollectionsDB)
				r.Delete("/", handlers.DropCollectionsDB)
			})

			// Integration CRUD — POST/GET/PUT/DELETE /projects/{id}/integrations
			r.Route("/{id}/integrations", func(r chi.Router) {
				r.Get("/", handlers.ListIntegrations)
				r.Post("/", handlers.CreateIntegration)

				r.Route("/{integrationId}", func(r chi.Router) {
					r.Get("/", handlers.GetIntegration)
					r.Put("/", handlers.UpdateIntegration)
					r.Delete("/", handlers.DeleteIntegration)
					r.Post("/test", handlers.TestIntegration)
				})
			})
		})
	})

	// SDK & Public API Routes (API Key Auth)
	r.Group(func(r chi.Router) {
		r.Use(auth.APIKeyAuth)

		r.Route("/api/v1", func(r chi.Router) {
			r.HandleFunc("/*", func(w http.ResponseWriter, r *http.Request) {
				if strings.HasPrefix(r.URL.Path, "/api/v1/db") {
					handlers.SetupCollectionsDB(w, r)
					return
				}
				handlers.ProxyToHub(w, r)
			})
		})
	})

	return r
}
