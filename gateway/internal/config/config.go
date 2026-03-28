package config

import (
	"os"
)

type Config struct {
	Port      string
	DBURL     string
	RedisURL  string
	JWTSecret string
	HubURL    string
}

// AppConfig holds the global, read-only configuration.
var AppConfig Config

func Init() {
	AppConfig = Config{
		Port:      getEnv("PORT", "8080"),
		DBURL:     getEnv("DB_URL", "postgres://nirman:nirmanpassword@localhost:5432/nirman_baas?sslmode=disable"),
		RedisURL:  getEnv("REDIS_URL", "localhost:6379"),
		JWTSecret: getEnv("JWT_SECRET", "nirman-super-secret-jwt-key"),
		HubURL:    getEnv("HUB_URL", "http://localhost:3000"),
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
