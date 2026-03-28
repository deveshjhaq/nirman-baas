package database

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Global database pool for handlers
var Pool *pgxpool.Pool

func NewPostgresPool(ctx context.Context, connString string) (*pgxpool.Pool, error) {
	config, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, fmt.Errorf("unable to parse connection string: %v", err)
	}

	// Pool configuration optimizations
	config.MaxConns = 50
	config.MinConns = 5
	config.MaxConnIdleTime = 30 * time.Minute
	config.MaxConnLifetime = 1 * time.Hour

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("unable to create connection pool: %v", err)
	}

	// Ping to verify connection
	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("unable to ping database: %v", err)
	}

	fmt.Println("✅ PostgreSQL (pgxpool) connected successfully")
	Pool = pool
	return pool, nil
}
