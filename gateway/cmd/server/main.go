package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"gateway/internal/cache"
	"gateway/internal/config"
	"gateway/internal/database"
	"gateway/internal/router"
)

func main() {
	fmt.Println("🚀 Starting Nirman API Gateway (Graceful Shutdown)...")

	// 1. Load generic flat configuration
	config.Init()

	// 2. Initialize core dependencies safely
	dbPool, err := database.NewPostgresPool(context.Background(), config.AppConfig.DBURL)
	if err != nil {
		log.Fatalf("Fatal: Could not connect to PostgreSQL via pgxpool: %v", err)
	}
	defer dbPool.Close()

	if err := cache.InitRedis(config.AppConfig.RedisURL); err != nil {
		log.Fatalf("Fatal: Could not connect to Redis: %v", err)
	}

	// 3. Build chi router with new handlers logic injected with pgxpool
	r := router.New()

	srv := &http.Server{
		Addr:    ":" + config.AppConfig.Port,
		Handler: r,
	}

	// 4. Goroutine for blocking HTTP server
	go func() {
		fmt.Printf("✅ Gateway listening on port %s\n", config.AppConfig.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// 5. Watch for termination signals to gracefully shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Shutting down server gracefully...")

	// 6. Provide 10 seconds to drain active connections before hard exit
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("✅ Gateway exited smoothly")
}
