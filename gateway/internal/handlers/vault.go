package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

// VaultCredentialsRequest represents the payload sent to Hub's vault endpoint
type VaultCredentialsRequest struct {
	ProjectID   string                 `json:"projectId"`
	Category    string                 `json:"category"`
	Provider    string                 `json:"provider"`
	Credentials map[string]interface{} `json:"credentials"`
	Config      map[string]interface{} `json:"config,omitempty"`
	IsDefault   bool                   `json:"isDefault"`
}

// VaultCredentialsResponse represents the response from Hub's vault endpoint
type VaultCredentialsResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

// StoreEncryptedCredentials sends credentials to Hub for encryption and storage
func StoreEncryptedCredentials(ctx context.Context, projectID, category, provider string, credentials, config map[string]interface{}, isDefault bool) error {
	hubURL := os.Getenv("HUB_URL")
	if hubURL == "" {
		hubURL = "http://hub:3000"
	}

	payload := VaultCredentialsRequest{
		ProjectID:   projectID,
		Category:    category,
		Provider:    provider,
		Credentials: credentials,
		Config:      config,
		IsDefault:   isDefault,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal vault request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", hubURL+"/internal/vault/credentials", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create vault request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Project-ID", projectID)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to call hub vault endpoint: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		var vaultResp VaultCredentialsResponse
		json.Unmarshal(body, &vaultResp)
		return fmt.Errorf("hub vault endpoint failed: %s", vaultResp.Error)
	}

	return nil
}

// UpdateEncryptedCredentials sends updated credentials to Hub for encryption and storage
func UpdateEncryptedCredentials(ctx context.Context, projectID, category, provider string, credentials, config map[string]interface{}, isDefault bool) error {
	hubURL := os.Getenv("HUB_URL")
	if hubURL == "" {
		hubURL = "http://hub:3000"
	}

	payload := VaultCredentialsRequest{
		ProjectID:   projectID,
		Category:    category,
		Provider:    provider,
		Credentials: credentials,
		Config:      config,
		IsDefault:   isDefault,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal vault request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "PUT", hubURL+"/internal/vault/credentials", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create vault request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Project-ID", projectID)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to call hub vault endpoint: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		var vaultResp VaultCredentialsResponse
		json.Unmarshal(body, &vaultResp)
		return fmt.Errorf("hub vault endpoint failed: %s", vaultResp.Error)
	}

	return nil
}
