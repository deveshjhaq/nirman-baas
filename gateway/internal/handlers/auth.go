package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"gateway/internal/auth"
	"gateway/internal/database"
	"gateway/internal/models"

	"golang.org/x/crypto/bcrypt"
)

func Register(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.Email == "" || req.Password == "" || req.FullName == "" {
		RespondError(w, http.StatusBadRequest, "Missing required fields")
		return
	}

	ctx := context.Background()
	var exists bool
	database.Pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", req.Email).Scan(&exists)
	if exists {
		RespondError(w, http.StatusConflict, "Email already registered")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	var user models.User
	err = database.Pool.QueryRow(ctx, `
		INSERT INTO users (email, password_hash, full_name)
		VALUES ($1, $2, $3)
		RETURNING id, email, full_name, is_verified, is_admin, created_at, updated_at
	`, req.Email, string(hashedPassword), req.FullName).Scan(
		&user.ID, &user.Email, &user.FullName,
		&user.IsVerified, &user.IsAdmin, &user.CreatedAt, &user.UpdatedAt,
	)
	
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	token, _ := auth.GenerateToken(user.ID, user.Email, user.IsAdmin)

	RespondJSON(w, http.StatusCreated, models.AuthResponse{
		Token: token,
		User:  user,
	})
}

func Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	ctx := context.Background()
	var user models.User
	
	err := database.Pool.QueryRow(ctx, `
		SELECT id, email, password_hash, full_name, is_verified, is_admin, created_at, updated_at
		FROM users WHERE email = $1
	`, req.Email).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.FullName,
		&user.IsVerified, &user.IsAdmin, &user.CreatedAt, &user.UpdatedAt,
	)
	
	if err != nil || bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)) != nil {
		RespondError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	token, _ := auth.GenerateToken(user.ID, user.Email, user.IsAdmin)

	RespondJSON(w, http.StatusOK, models.AuthResponse{
		Token: token,
		User:  user,
	})
}

func GetProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	ctx := context.Background()
	var user models.User
	err := database.Pool.QueryRow(ctx, `
		SELECT id, email, full_name, is_verified, is_admin, created_at, updated_at
		FROM users WHERE id = $1
	`, userID).Scan(
		&user.ID, &user.Email, &user.FullName,
		&user.IsVerified, &user.IsAdmin, &user.CreatedAt, &user.UpdatedAt,
	)
	
	if err != nil {
		RespondError(w, http.StatusNotFound, "User not found")
		return
	}

	RespondJSON(w, http.StatusOK, user)
}
