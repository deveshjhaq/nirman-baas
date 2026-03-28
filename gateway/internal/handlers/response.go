package handlers

import (
	"encoding/json"
	"net/http"
)

// RespondJSON sends a JSON response with a specific status code
func RespondJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if payload != nil {
		json.NewEncoder(w).Encode(payload)
	}
}

// RespondError sends a JSON error message
func RespondError(w http.ResponseWriter, status int, message string) {
	RespondJSON(w, status, map[string]string{"error": message})
}
