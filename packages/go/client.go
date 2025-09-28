package meld

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

const (
	DefaultBaseURL = "https://sdk-api.meld.ai/"
	DefaultTimeout = 60 * time.Second
)

// ClientOptions configures the Meld client
type ClientOptions struct {
	APIKey     string
	BaseURL    string
	Timeout    time.Duration
	HTTPClient *http.Client
}

// MeldsResource handles Meld workflow operations
type MeldsResource struct {
	client *Client
}

// Client is the main Meld client
type Client struct {
	apiKey      string
	baseURL     string
	timeout     time.Duration
	httpClient  *http.Client
	Melds       *MeldsResource
}

// NewClient creates a new Meld client
func NewClient(opts *ClientOptions) *Client {
	if opts == nil {
		opts = &ClientOptions{}
	}

	apiKey := opts.APIKey
	if apiKey == "" {
		apiKey = os.Getenv("MELD_API_KEY")
	}

	baseURL := opts.BaseURL
	if baseURL == "" {
		baseURL = DefaultBaseURL
	}

	timeout := opts.Timeout
	if timeout == 0 {
		timeout = DefaultTimeout
	}

	httpClient := opts.HTTPClient
	if httpClient == nil {
		httpClient = &http.Client{Timeout: timeout}
	}

	client := &Client{
		apiKey:     apiKey,
		baseURL:    baseURL,
		timeout:    timeout,
		httpClient: httpClient,
	}
	client.Melds = &MeldsResource{client: client}
	return client
}

// EnsureAndRunWebhookOptions defines the parameters for ensuring and running a Meld
type EnsureAndRunWebhookOptions[T any] struct {
	Name           string
	Input          map[string]interface{}
	Mode           string // "sync" or "async"
	ResponseObject T
	Template       map[string]interface{}
	CallbackUrl    string
	Metadata       map[string]interface{}
	Timeout        time.Duration
}

// EnsureAndRunWebhook ensures (create/update) a meld by name and runs it
func (m *MeldsResource) EnsureAndRunWebhook[T any](ctx context.Context, options EnsureAndRunWebhookOptions[T]) (T, error) {
	var result T

	if m.client.apiKey == "" {
		return result, fmt.Errorf("missing API key. Pass apiKey or set MELD_API_KEY environment variable")
	}

	// Validate async mode requires callbackUrl
	if options.Mode == "async" && options.CallbackUrl == "" {
		return result, fmt.Errorf("callbackUrl is required for async mode")
	}

	// Determine endpoint
	endpoint := m.client.baseURL + "/api/v1/meld-run"
	if options.Mode == "sync" || options.Mode == "" {
		endpoint += "/sync"
	}

	// Create request payload
	payload := map[string]interface{}{
		"name":           options.Name,
		"input":          options.Input,
		"responseObject": options.ResponseObject,
	}
	if options.Template != nil {
		payload["template"] = options.Template
	}
	if options.CallbackUrl != "" {
		payload["callbackUrl"] = options.CallbackUrl
	}
	if options.Metadata != nil {
		payload["metadata"] = options.Metadata
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return result, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Create HTTP request
	req, err := http.NewRequestWithContext(ctx, "POST", endpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		return result, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+m.client.apiKey)
	req.Header.Set("X-Meld-Client", "@meldai/go-sdk")

	// Execute request
	resp, err := m.client.httpClient.Do(req)
	if err != nil {
		return result, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return result, fmt.Errorf("failed to read response: %w", err)
	}

	// Check for HTTP errors
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		var apiErr APIError
		if err := json.Unmarshal(body, &apiErr); err == nil {
			apiErr.Status = resp.StatusCode
			apiErr.RunID = resp.Header.Get("X-Run-Id")
			return result, &apiErr
		}
		return result, fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}

	// Parse response
	if err := json.Unmarshal(body, &result); err != nil {
		return result, fmt.Errorf("failed to parse response: %w", err)
	}

	return result, nil
}
