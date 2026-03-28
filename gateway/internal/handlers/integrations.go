package handlers

import (
	"bytes"
	"context"
	"io"
	"net/http"

	"gateway/internal/config"
	"gateway/internal/database"

	"github.com/go-chi/chi/v5"
)

// Integrations, Project CRUD and Proxied proxy logic condensed as per target tree.

// GetProject API to verify ownership
func GetProject(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	projectID := chi.URLParam(r, "id")

	var exists bool
	ctx := context.Background()
	database.Pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM projects WHERE id = $1 AND user_id = $2)`, projectID, userID).Scan(&exists)
	
	if !exists {
		RespondError(w, http.StatusNotFound, "Project not found")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]interface{}{"id": projectID, "status": "active"})
}

// ProxyToHub proxies dynamic paths directly to the integrations hub internally.
func ProxyToHub(w http.ResponseWriter, r *http.Request) {
	projectID := r.Context().Value("project_id").(string)
	
	hubURL := config.AppConfig.HubURL
	if hubURL == "" {
		RespondError(w, http.StatusInternalServerError, "Hub configuration missing")
		return
	}

	targetURL := hubURL + r.URL.Path

	bodyBytes, _ := io.ReadAll(r.Body)
	r.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	proxyReq, err := http.NewRequest(r.Method, targetURL, bytes.NewBuffer(bodyBytes))
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to build proxy request")
		return
	}

	proxyReq.Header = r.Header.Clone()
	proxyReq.Header.Set("X-Project-ID", projectID)
	// Clear standard Origin restrictions for internal microservice hop
	proxyReq.Header.Del("Origin")

	client := &http.Client{}
	resp, err := client.Do(proxyReq)
	if err != nil {
		RespondError(w, http.StatusBadGateway, "Integrations Hub is unreachable")
		return
	}
	defer resp.Body.Close()

	for key, values := range resp.Header {
		for _, value := range values {
			w.Header().Add(key, value)
		}
	}
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}
