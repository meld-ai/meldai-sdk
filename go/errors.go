package meld

import "fmt"

// APIError represents an error returned by the Meld API
type APIError struct {
	Message   string      `json:"message"`
	Status    int         `json:"status"`
	RequestID string      `json:"request_id"`
	Data      interface{} `json:"data"`
}

// Error implements the error interface
func (e *APIError) Error() string {
	if e.RequestID != "" {
		return fmt.Sprintf("Meld API error (status %d, request %s): %s", e.Status, e.RequestID, e.Message)
	}
	return fmt.Sprintf("Meld API error (status %d): %s", e.Status, e.Message)
}
