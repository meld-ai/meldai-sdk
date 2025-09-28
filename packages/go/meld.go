package meld

// Package meld provides a Go SDK for Meld.ai
//
// Example usage:
//
//	client := meld.NewClient(&meld.ClientOptions{
//		APIKey: "your-api-key",
//	})
//
//	type MyOutput struct {
//		Title string `json:"title"`
//		Body  string `json:"body"`
//	}
//
//	result, err := client.Melds.EnsureAndRunWebhook(context.Background(), meld.EnsureAndRunWebhookOptions[MyOutput]{
//		Name: "translate-to-french",
//		Input: map[string]interface{}{"text": "Hello world"},
//		Mode: "sync",
//		ResponseObject: MyOutput{},
//	})
//
//	if err != nil {
//		log.Fatal(err)
//	}
//
//	fmt.Printf("Result: %+v\n", result)
