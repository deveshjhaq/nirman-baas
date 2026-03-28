package models

import "time"

type Integration struct {
	ID               string     `json:"id"`
	ProjectID        string     `json:"project_id"`
	Provider         string     `json:"provider"`
	ProviderCategory string     `json:"provider_category"`
	Credentials      string     `json:"credentials,omitempty"`
	Config           string     `json:"config"`
	Status           string     `json:"status"`
	IsDefault        bool       `json:"is_default"`
	LastTestedAt     *time.Time `json:"last_tested_at"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

type CreateIntegrationRequest struct {
	Provider         string                 `json:"provider"`
	ProviderCategory string                 `json:"provider_category"`
	Credentials      map[string]string      `json:"credentials"`
	Config           map[string]interface{} `json:"config"`
	IsDefault        bool                   `json:"is_default"`
}

type UpdateIntegrationRequest struct {
	Credentials map[string]string      `json:"credentials"`
	Config      map[string]interface{} `json:"config"`
	IsDefault   bool                   `json:"is_default"`
	Status      string                 `json:"status"`
}
