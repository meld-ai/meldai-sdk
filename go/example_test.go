package meld

import (
	"context"
	"os"
	"testing"
	"time"
)

func TestClient_RunMeld(t *testing.T) {
	// Skip if no API key is set
	if os.Getenv("MELD_API_KEY") == "" {
		t.Skip("MELD_API_KEY not set, skipping integration test")
	}

	client := NewClient(&ClientOptions{
		Timeout: 30 * time.Second,
	})

	type StructuredOutput struct {
		Body  string `json:"body"`
		Title string `json:"title"`
	}

	ctx := context.Background()
	result, err := client.RunMeld(ctx, RunMeldOptions[StructuredOutput]{
		MeldId:       "translate-to-french",
		Instructions: "Convert the provided input into french",
		ResponseObject: StructuredOutput{
			Title: "Hello",
			Body:  "This is a test payload",
		},
	})

	if err != nil {
		t.Fatalf("RunMeld failed: %v", err)
	}

	// Check that we got a result (exact content may vary)
	if result.Title == "" || result.Body == "" {
		t.Errorf("Expected non-empty title and body, got title='%s', body='%s'", result.Title, result.Body)
	}
}
