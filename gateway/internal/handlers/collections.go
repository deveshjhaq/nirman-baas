package handlers

import (
	"context"
	"net/http"
	"encoding/json"

	"gateway/internal/database"
	"github.com/go-chi/chi/v5"
)

type CollectionReq struct {
	Name string `json:"name"`
}

func SetupCollectionsDB(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "id")
	
	var req CollectionReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Name == "" {
		RespondError(w, http.StatusBadRequest, "Invalid collection name")
		return
	}

	ctx := context.Background()
	err := database.CreateCollection(ctx, projectID, req.Name)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to create collection: "+err.Error())
		return
	}

	RespondJSON(w, http.StatusCreated, map[string]string{
		"message": "Collection " + req.Name + " created successfully",
	})
}

func DropCollectionsDB(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "id")
	collName := r.URL.Query().Get("name")

	if collName == "" {
		RespondError(w, http.StatusBadRequest, "Collection name 'name' required in query param")
		return
	}

	ctx := context.Background()
	err := database.DropCollection(ctx, projectID, collName)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to drop collection")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]string{"message": "Collection dropped successfully"})
}
