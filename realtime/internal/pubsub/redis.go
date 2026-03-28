package pubsub

import (
	"context"
	"encoding/json"
	"log"
	"os"

	"realtime/internal/hub"

	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()

func ListenForMessages(h *hub.Hub) {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "localhost:6379"
	}

	rdb := redis.NewClient(&redis.Options{
		Addr: redisURL,
	})

	log.Println("✅ Subscribed to Redis channel: nirman_realtime")
	pubsub := rdb.Subscribe(ctx, "nirman_realtime")

	// Wait for confirmation that subscription is created before publishing anything.
	_, err := pubsub.Receive(ctx)
	if err != nil {
		log.Fatalf("Cannot subscribe to Redis: %v", err)
	}

	// Go channel which receives messages.
	ch := pubsub.Channel()

	for msg := range ch {
		var payload hub.MessagePayload
		if err := json.Unmarshal([]byte(msg.Payload), &payload); err != nil {
			log.Printf("Error unmarshalling pubsub message: %v", err)
			continue
		}
		
		// Broadcast to all connected websockets for this project
		h.Broadcast(payload)
	}
}
