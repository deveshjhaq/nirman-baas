package database

import (
	"context"
	"fmt"
)

// CreateCollection dynamically creates a schema-less (JSONB payload) table.
func CreateCollection(ctx context.Context, projectID string, collectionName string) error {
	tableName := fmt.Sprintf("coll_%s_%s", projectID, collectionName)
	
	query := fmt.Sprintf(`
		CREATE TABLE IF NOT EXISTS %s (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
			data JSONB NOT NULL DEFAULT '{}',
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);
		CREATE INDEX IF NOT EXISTS idx_%s_project ON %s (project_id);
	`, tableName, tableName, tableName)

	_, err := Pool.Exec(ctx, query)
	return err
}

// DropCollection dynamically drops a collection table.
func DropCollection(ctx context.Context, projectID string, collectionName string) error {
	tableName := fmt.Sprintf("coll_%s_%s", projectID, collectionName)
	query := fmt.Sprintf(`DROP TABLE IF EXISTS %s`, tableName)
	_, err := Pool.Exec(ctx, query)
	return err
}
