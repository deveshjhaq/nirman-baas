package database

import (
	"fmt"
	"strings"
)

// BuildInsert generates an INSERT query string and its arguments list 
// for a given table and map of column -> values.
func BuildInsert(table string, data map[string]interface{}) (string, []interface{}) {
	if len(data) == 0 {
		return "", nil
	}

	columns := make([]string, 0, len(data))
	placeholders := make([]string, 0, len(data))
	args := make([]interface{}, 0, len(data))

	i := 1
	for col, val := range data {
		columns = append(columns, col)
		placeholders = append(placeholders, fmt.Sprintf("$%d", i))
		args = append(args, val)
		i++
	}

	query := fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s) RETURNING *", 
		table, 
		strings.Join(columns, ", "), 
		strings.Join(placeholders, ", "))

	return query, args
}

// BuildUpdate generates an UPDATE query string and args based on dynamic inputs.
func BuildUpdate(table string, idCol string, idVal interface{}, data map[string]interface{}) (string, []interface{}) {
	if len(data) == 0 {
		return "", nil
	}

	setClauses := make([]string, 0, len(data))
	args := make([]interface{}, 0, len(data)+1)

	i := 1
	for col, val := range data {
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", col, i))
		args = append(args, val)
		i++
	}

	args = append(args, idVal)
	query := fmt.Sprintf("UPDATE %s SET %s WHERE %s = $%d RETURNING *", 
		table, 
		strings.Join(setClauses, ", "), 
		idCol, 
		i)

	return query, args
}
