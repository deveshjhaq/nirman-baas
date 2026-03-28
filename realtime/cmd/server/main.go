package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"realtime/internal/auth"
	"realtime/internal/hub"
	"realtime/internal/pubsub"
)

func main() {
	fmt.Println("🌊 Starting Nirman Realtime WebSockets Server...")

	h := hub.NewHub()
	go h.Run()

	// Start Redis listener in a goroutine
	go pubsub.ListenForMessages(h)

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		token := r.URL.Query().Get("token")
		projectID := r.URL.Query().Get("project_id")

		if token == "" || projectID == "" {
			http.Error(w, "Missing token or project_id", http.StatusUnauthorized)
			return
		}

		// Basic JWT validation to ensure connection is from an authenticated dashboard user
		_, err := auth.ValidateToken(token)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Basic verification passed, upgrade the HTTP server connection to the WebSocket protocol.
		hub.ServeWs(h, w, r, projectID)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	log.Printf("✅ Realtime Server listening on :%s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
