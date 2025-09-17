package meld

import "fmt"

// APIError represents an error returned by the Meld API
type APIError struct {
	Message string      `json:"message"`
	Status  int         `json:"status"`
	RunID   string      `json:"run_id"`
	Data    interface{} `json:"data"`
}

// Error implements the error interface
func (e *APIError) Error() string {
	if e.RunID != "" {
		return fmt.Sprintf("Meld API error (status %d, run %s): %s", e.Status, e.RunID, e.Message)
	}
	return fmt.Sprintf("Meld API error (status %d): %s", e.Status, e.Message)
}
