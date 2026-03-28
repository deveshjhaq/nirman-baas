package auth

import (
	"fmt"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID  string `json:"user_id"`
	Email   string `json:"email"`
	IsAdmin bool   `json:"is_admin"`
	jwt.RegisteredClaims
}

func ValidateToken(tokenStr string) (*Claims, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "nirman-super-secret-jwt-key"
	}

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}
