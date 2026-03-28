package auth

import (
	"time"

	"gateway/internal/config"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID  string `json:"user_id"`
	Email   string `json:"email"`
	IsAdmin bool   `json:"is_admin"`
	jwt.RegisteredClaims
}

func GenerateToken(userID, email string, isAdmin bool) (string, error) {
	claims := Claims{
		UserID:  userID,
		Email:   email,
		IsAdmin: isAdmin,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "nirman-baas",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.AppConfig.JWTSecret))
}

func ValidateToken(tokenStr string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.AppConfig.JWTSecret), nil
	})

	if err != nil || !token.Valid {
		return nil, err
	}
	return claims, nil
}
