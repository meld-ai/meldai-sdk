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
//	result, err := client.RunMeld(context.Background(), meld.RunMeldOptions[MyOutput]{
//		Instructions: "Summarize the input succinctly in french",
//		ResponseObject: MyOutput{Title: "Hello", Body: "This is an example payload"},
//	})
//
//	if err != nil {
//		log.Fatal(err)
//	}
//
//	fmt.Printf("Result: %+v\n", result)
