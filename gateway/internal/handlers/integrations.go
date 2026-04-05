package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"gateway/internal/database"
	"gateway/internal/models"

	"github.com/go-chi/chi/v5"
)

// ─── helpers ──────────────────────────────────────────────────────────────────

// ownsProject returns true if the JWT user owns the given project.
func ownsProject(ctx context.Context, projectID, userID string) bool {
	var exists bool
	database.Pool.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM projects WHERE id = $1 AND user_id = $2)`,
		projectID, userID,
	).Scan(&exists)
	return exists
}

// ─── List integrations ────────────────────────────────────────────────────────

// ListIntegrations handles GET /projects/{id}/integrations
// Optional query: ?category=otp|email|maps|...
func ListIntegrations(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	projectID := chi.URLParam(r, "id")

	if !ownsProject(r.Context(), projectID, userID) {
		RespondError(w, http.StatusNotFound, "Project not found")
		return
	}

	category := r.URL.Query().Get("category")

	var rows interface{}
	var err error

	if category != "" {
		rows, err = database.Pool.Query(r.Context(),
			`SELECT id, project_id, provider, provider_category, config, status, is_default, last_tested_at, created_at, updated_at
			 FROM integrations
			 WHERE project_id = $1 AND provider_category = $2
			 ORDER BY created_at DESC`,
			projectID, category,
		)
	} else {
		rows, err = database.Pool.Query(r.Context(),
			`SELECT id, project_id, provider, provider_category, config, status, is_default, last_tested_at, created_at, updated_at
			 FROM integrations
			 WHERE project_id = $1
			 ORDER BY provider_category, created_at DESC`,
			projectID,
		)
	}

	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to fetch integrations")
		return
	}

	// Type-assert to pgx Rows
	type pgxRows interface {
		Next() bool
		Scan(dest ...any) error
		Close()
		Err() error
	}
	pgRows := rows.(pgxRows)
	defer pgRows.Close()

	integrations := make([]models.Integration, 0)
	for pgRows.Next() {
		var i models.Integration
		err := pgRows.Scan(
			&i.ID, &i.ProjectID, &i.Provider, &i.ProviderCategory,
			&i.Config, &i.Status, &i.IsDefault, &i.LastTestedAt,
			&i.CreatedAt, &i.UpdatedAt,
		)
		if err != nil {
			RespondError(w, http.StatusInternalServerError, "Failed to scan integration row")
			return
		}
		integrations = append(integrations, i)
	}
	if pgRows.Err() != nil {
		RespondError(w, http.StatusInternalServerError, "Row iteration error")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]interface{}{
		"project_id":   projectID,
		"integrations": integrations,
		"total":        len(integrations),
	})
}

// ─── Get single integration ───────────────────────────────────────────────────

// GetIntegration handles GET /projects/{id}/integrations/{integrationId}
func GetIntegration(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	projectID := chi.URLParam(r, "id")
	integrationID := chi.URLParam(r, "integrationId")

	if !ownsProject(r.Context(), projectID, userID) {
		RespondError(w, http.StatusNotFound, "Project not found")
		return
	}

	var i models.Integration
	err := database.Pool.QueryRow(r.Context(),
		`SELECT id, project_id, provider, provider_category, config, status, is_default, last_tested_at, created_at, updated_at
		 FROM integrations
		 WHERE id = $1 AND project_id = $2`,
		integrationID, projectID,
	).Scan(
		&i.ID, &i.ProjectID, &i.Provider, &i.ProviderCategory,
		&i.Config, &i.Status, &i.IsDefault, &i.LastTestedAt,
		&i.CreatedAt, &i.UpdatedAt,
	)
	if err != nil {
		RespondError(w, http.StatusNotFound, "Integration not found")
		return
	}

	RespondJSON(w, http.StatusOK, i)
}

// ─── Create integration ───────────────────────────────────────────────────────

// CreateIntegration handles POST /projects/{id}/integrations
func CreateIntegration(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	projectID := chi.URLParam(r, "id")

	if !ownsProject(r.Context(), projectID, userID) {
		RespondError(w, http.StatusNotFound, "Project not found")
		return
	}

	var req models.CreateIntegrationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.Provider == "" || req.ProviderCategory == "" {
		RespondError(w, http.StatusBadRequest, "provider and provider_category are required")
		return
	}

	// Send credentials to Hub for encryption and storage
	err := StoreEncryptedCredentials(
		r.Context(),
		projectID,
		req.ProviderCategory,
		req.Provider,
		req.Credentials,
		req.Config,
		req.IsDefault,
	)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to store encrypted credentials: "+err.Error())
		return
	}

	// Store metadata in gateway DB (without credentials)
	configJSON, _ := json.Marshal(req.Config)

	// If this is set as default, clear existing default for this category first
	if req.IsDefault {
		database.Pool.Exec(r.Context(),
			`UPDATE integrations SET is_default = FALSE
			 WHERE project_id = $1 AND provider_category = $2 AND is_default = TRUE`,
			projectID, req.ProviderCategory,
		)
	}

	var i models.Integration
	err = database.Pool.QueryRow(r.Context(),
		`INSERT INTO integrations (project_id, provider, provider_category, config, is_default, status)
		 VALUES ($1, $2, $3, $4, $5, 'pending_setup')
		 RETURNING id, project_id, provider, provider_category, config, status, is_default, last_tested_at, created_at, updated_at`,
		projectID, req.Provider, req.ProviderCategory,
		string(configJSON), req.IsDefault,
	).Scan(
		&i.ID, &i.ProjectID, &i.Provider, &i.ProviderCategory,
		&i.Config, &i.Status, &i.IsDefault, &i.LastTestedAt,
		&i.CreatedAt, &i.UpdatedAt,
	)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to create integration")
		return
	}

	RespondJSON(w, http.StatusCreated, i)
}

// ─── Update integration ───────────────────────────────────────────────────────

// UpdateIntegration handles PUT /projects/{id}/integrations/{integrationId}
func UpdateIntegration(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	projectID := chi.URLParam(r, "id")
	integrationID := chi.URLParam(r, "integrationId")

	if !ownsProject(r.Context(), projectID, userID) {
		RespondError(w, http.StatusNotFound, "Project not found")
		return
	}

	var req models.UpdateIntegrationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Fetch existing integration to get provider and category
	var provider, category string
	err := database.Pool.QueryRow(r.Context(),
		`SELECT provider, provider_category FROM integrations WHERE id = $1 AND project_id = $2`,
		integrationID, projectID,
	).Scan(&provider, &category)
	
	if err != nil {
		RespondError(w, http.StatusNotFound, "Integration not found")
		return
	}

	// Update credentials in Hub's encrypted vault
	err = UpdateEncryptedCredentials(
		r.Context(),
		projectID,
		category,
		provider,
		req.Credentials,
		req.Config,
		req.IsDefault,
	)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to update encrypted credentials: "+err.Error())
		return
	}

	configJSON, _ := json.Marshal(req.Config)

	// Determine target status — default to existing if not provided
	status := req.Status
	if status == "" {
		status = "pending_setup"
	}

	// Clear existing default for the category if promoting this one
	if req.IsDefault {
		database.Pool.Exec(r.Context(),
			`UPDATE integrations SET is_default = FALSE
			 WHERE project_id = $1 AND provider_category = $2 AND is_default = TRUE AND id != $3`,
			projectID, category, integrationID,
		)
	}

	var i models.Integration
	err = database.Pool.QueryRow(r.Context(),
		`UPDATE integrations
		 SET config = $1, is_default = $2, status = $3, updated_at = $4
		 WHERE id = $5 AND project_id = $6
		 RETURNING id, project_id, provider, provider_category, config, status, is_default, last_tested_at, created_at, updated_at`,
		string(configJSON), req.IsDefault, status, time.Now(),
		integrationID, projectID,
	).Scan(
		&i.ID, &i.ProjectID, &i.Provider, &i.ProviderCategory,
		&i.Config, &i.Status, &i.IsDefault, &i.LastTestedAt,
		&i.CreatedAt, &i.UpdatedAt,
	)
	if err != nil {
		RespondError(w, http.StatusNotFound, "Integration not found or update failed")
		return
	}

	RespondJSON(w, http.StatusOK, i)
}

// ─── Delete integration ───────────────────────────────────────────────────────

// DeleteIntegration handles DELETE /projects/{id}/integrations/{integrationId}
func DeleteIntegration(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	projectID := chi.URLParam(r, "id")
	integrationID := chi.URLParam(r, "integrationId")

	if !ownsProject(r.Context(), projectID, userID) {
		RespondError(w, http.StatusNotFound, "Project not found")
		return
	}

	tag, err := database.Pool.Exec(r.Context(),
		`DELETE FROM integrations WHERE id = $1 AND project_id = $2`,
		integrationID, projectID,
	)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to delete integration")
		return
	}

	// pgconn.CommandTag — check rows affected
	if tag.RowsAffected() == 0 {
		RespondError(w, http.StatusNotFound, "Integration not found")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]string{
		"message": "Integration deleted successfully",
		"id":      integrationID,
	})
}

// ─── Test integration ─────────────────────────────────────────────────────────

// TestIntegration handles POST /projects/{id}/integrations/{integrationId}/test
// Marks the integration as tested and (in future) pings the Hub to validate credentials.
func TestIntegration(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	projectID := chi.URLParam(r, "id")
	integrationID := chi.URLParam(r, "integrationId")

	if !ownsProject(r.Context(), projectID, userID) {
		RespondError(w, http.StatusNotFound, "Project not found")
		return
	}

	now := time.Now()
	tag, err := database.Pool.Exec(r.Context(),
		`UPDATE integrations
		 SET last_tested_at = $1, status = 'active', updated_at = $2
		 WHERE id = $3 AND project_id = $4`,
		now, now, integrationID, projectID,
	)
	if err != nil || tag.RowsAffected() == 0 {
		RespondError(w, http.StatusNotFound, "Integration not found")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]interface{}{
		"message":        "Integration tested successfully",
		"id":             integrationID,
		"status":         "active",
		"last_tested_at": now,
	})
}
