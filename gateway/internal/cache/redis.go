package cache

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

var Client *redis.Client

func InitRedis(url string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	Client = redis.NewClient(&redis.Options{
		Addr: url,
	})

	err := Client.Ping(ctx).Err()
	if err != nil {
		return err
	}
	
	fmt.Println("✅ Redis cache operational")
	return nil
}

// CheckRateLimit implements a basic sliding window rate limiting.
func CheckRateLimit(ctx context.Context, key string, limit int, window time.Duration) (bool, error) {
	pipe := Client.Pipeline()
	now := time.Now().UnixNano()
	windowStart := now - window.Nanoseconds()
	
	// Remove old entries
	pipe.ZRemRangeByScore(ctx, key, "0", fmt.Sprintf("%d", windowStart))
	// Add current request time
	pipe.ZAdd(ctx, key, redis.Z{Score: float64(now), Member: now})
	// Count requests in window
	count := pipe.ZCard(ctx, key)
	// Set expire to prevent memory leak
	pipe.Expire(ctx, key, window)
	
	_, err := pipe.Exec(ctx)
	if err != nil {
		return false, err
	}

	return count.Val() <= int64(limit), nil
}
