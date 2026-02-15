package services

import (
	"time"
	"github.com/google/uuid"
)

// generateUUID generates a unique ID
func generateUUID() string {
	return uuid.New().String()
}

// getCurrentTime returns the current time in RFC3339 format
func getCurrentTime() string {
	return time.Now().Format(time.RFC3339)
}
