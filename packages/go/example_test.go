package meld

import (
	"context"
	"os"
	"testing"
	"time"
)

func TestClient_BuildAndRun(t *testing.T) {
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
	result, err := client.Melds.BuildAndRun(ctx, BuildAndRunOptions[StructuredOutput]{
		Name: "translate-to-french",
		Input: map[string]interface{}{
			"text":         "Hello world",
			"instructions": "Convert text to formal French.",
		},
		Mode: "sync",
		ResponseObject: StructuredOutput{
			Title: "",
			Body:  "",
		},
	})

	if err != nil {
		t.Fatalf("EnsureAndRunWebhook failed: %v", err)
	}

	// Check that we got a result (exact content may vary)
	if result.Title == "" || result.Body == "" {
		t.Errorf("Expected non-empty title and body, got title='%s', body='%s'", result.Title, result.Body)
	}
}
