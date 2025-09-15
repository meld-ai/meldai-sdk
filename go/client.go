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
	DefaultBaseURL = "https://app.meld.ai"
	DefaultTimeout = 60 * time.Second
	ClientVersion  = "1.0.0"
)

// ClientOptions configures the Meld client
type ClientOptions struct {
	APIKey   string
	BaseURL  string
	Timeout  time.Duration
	HTTPClient *http.Client
}

// RunMeldOptions defines the parameters for running a Meld
type RunMeldOptions[T any] struct {
	MeldId       string
	Instructions string
	ResponseObject T
	CallbackUrl  string
	Timeout      time.Duration
}

// Client is the main Meld client
type Client struct {
	apiKey      string
	baseURL     string
	timeout     time.Duration
	httpClient  *http.Client
}

// NewClient creates a new Meld client
func NewClient(opts *ClientOptions) *Client {
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

	return &Client{
		apiKey:     apiKey,
		baseURL:    baseURL,
		timeout:    timeout,
		httpClient: httpClient,
	}
}

// RunMeld executes a Meld workflow
func (c *Client) RunMeld[T any](ctx context.Context, options RunMeldOptions[T]) (T, error) {
	var result T

	if c.apiKey == "" {
		return result, fmt.Errorf("missing API key. Pass apiKey or set MELD_API_KEY environment variable")
	}

	// Determine endpoint based on callbackUrl presence
	endpoint := c.baseURL + "/api/v1/run-meld"
	if options.CallbackUrl == "" {
		endpoint += "/sync"
	}

	// Create request payload
	payload := map[string]interface{}{
		"meldId":       options.MeldId,
		"instructions": options.Instructions,
		"inputObject":  options.ResponseObject,
	}
	if options.CallbackUrl != "" {
		payload["callbackUrl"] = options.CallbackUrl
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
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("X-Meld-Client", fmt.Sprintf("meldai-go-sdk/%s", ClientVersion))

	// Execute request
	resp, err := c.httpClient.Do(req)
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
