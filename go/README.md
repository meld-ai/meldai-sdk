# WORK IN PROGRESS!

# Meld.ai Go SDK

> ⚠️ **WORK IN PROGRESS** ⚠️
> 
> This Go SDK is currently under development and not yet ready for production use.

Official Go SDK for **Meld.ai** — your all-in-one toolkit for building with AI.

Go from duct-taped prompts to durable AI systems — fast. Meld is your workbench for designing, controlling, collaborating & deploying AI systems with confidence. This SDK lets you programmatically run your Melds (AI workflows) with full observability and type safety.

## Install

```bash
go get github.com/meldai/go-sdk
```

## Quickstart

```go
package main

import (
    "context"
    "fmt"
    "log"
    
    "github.com/meldai/go-sdk"
)

func main() {
    client := meld.NewClient(&meld.ClientOptions{
        APIKey: os.Getenv("MELD_API_KEY"),
    })

    type MyStructuredOutput struct {
        Title string `json:"title"`
        Body  string `json:"body"`
    }

    result, err := client.RunMeld(context.Background(), meld.RunMeldOptions[MyStructuredOutput]{
        MeldId: "your-meld-id",
        Instructions: "Summarize the input succinctly in french",
        ResponseObject: MyStructuredOutput{
            Title: "Hello", 
            Body: "This is an example payload",
        },
    })

    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Result: %+v\n", result)
    // Output: {Title: "Bonjour", Body: "Ceci est un exemple de charge utile"}
}
```

## API

### `NewClient(options *ClientOptions) *Client`

Creates a new Meld client with the given options.

```go
type ClientOptions struct {
    APIKey     string        // API key (defaults to MELD_API_KEY env var)
    BaseURL    string        // API base URL (defaults to production endpoint)
    Timeout    time.Duration // Request timeout (defaults to 60s)
    HTTPClient *http.Client  // Custom HTTP client (optional)
}
```

### `RunMeld[T](ctx context.Context, options RunMeldOptions[T]) (T, error)`

Executes a Meld workflow and returns the structured result.

```go
type RunMeldOptions[T any] struct {
    MeldId         string        // Meld ID to execute
    Instructions   string        // Instructions for the AI workflow
    ResponseObject T             // Input data to process
    CallbackUrl    string        // Optional callback URL for async execution
    Timeout        time.Duration // Override default timeout (optional)
}
```

## Error Handling

API errors are returned as `*APIError`:

```go
result, err := client.RunMeld(ctx, options)
if err != nil {
    var apiErr *meld.APIError
    if errors.As(err, &apiErr) {
        fmt.Printf("API Error: %s (status: %d, request: %s)\n", 
            apiErr.Message, apiErr.Status, apiErr.RequestID)
    } else {
        fmt.Printf("Other error: %v\n", err)
    }
    return
}
```

## Examples

See `example_test.go` for a complete working example.

## License

MIT © 2025
