# Meld.ai SDK

> Official TypeScript SDK for **Meld.ai** — your all-in-one toolkit for building with AI.

Go from duct-taped prompts to durable AI systems — fast. Meld is your workbench for designing, controlling, collaborating & deploying AI systems with confidence. 

This SDK lets you programmatically run your Melds (AI workflows) with full observability and type safety.

# Installation

## TypeScript

```bash
npm install @meldai/sdk
# or
pnpm add @meldai/sdk
# or
yarn add @meldai/sdk
```

## Basic example

- Run an AI workflow and get a returned structured result synchronously
- CallbackUrl to get the result asynchronously
- Use Zod schemas for automatic validation and type inference

### Using Zod Schemas (Recommended)

```ts
import { MeldClient } from "@meldai/sdk";
import { z } from "zod";

const client = new MeldClient({ apiKey: process.env.MELD_API_KEY });

const main = async () => {
  // Define your expected response structure with Zod
  const responseSchema = z.object({
    title: z.string(),
    body: z.string(),
  });

  type TranslationResult = z.infer<typeof responseSchema>;

  const result = await client.melds.ensureAndRunWebhook<TranslationResult>({
    name: "translate-to-french",
    input: { 
      message: "Hello world", 
      userId: 123,
      instructions: "Convert the provided input into french"
    },
    mode: "sync",
    responseObject: responseSchema,
    metadata: { requestId: "abc-123" },
  });

  console.log('result', result);
  // { title: "Bonjour", body: "Ceci est une charge utile de test" }
  // Fully typed and validated!
};

main().catch(console.error);
```

### Using Plain Objects

```ts
import { MeldClient } from "@meldai/sdk";

const client = new MeldClient({ apiKey: process.env.MELD_API_KEY });

const main = async () => {
  type StructuredOutput = { body: string, title: string };

  const result = await client.melds.ensureAndRunWebhook<StructuredOutput>({
    name: "translate-to-french",
    input: { 
      message: "Hello world", 
      userId: 123,
      instructions: "Convert the provided input into french"
    },
    mode: "sync",
    responseObject: { title: "string", body: "string" }, // Plain object descriptor
    metadata: { requestId: "abc-123" },
  });

  console.log(result);
  // { title: "Bonjour", body: "Ceci est une charge utile de test" }
};

main().catch(console.error);
```

## Go

```bash
go get github.com/meld-ai/meldai-core/go-sdk
```

```go
package main

import (
    "context"
    "fmt"
    "log"
    "os"
    
    "github.com/meld-ai/meldai-core/go-sdk"
)

func main() {
    client := meld.NewClient(&meld.ClientOptions{
        APIKey: os.Getenv("MELD_API_KEY"),
    })

    type StructuredOutput struct {
        Body  string `json:"body"`
        Title string `json:"title"`
    }

    result, err := client.Melds.EnsureAndRunWebhook(context.Background(), meld.EnsureAndRunWebhookOptions[StructuredOutput]{
        Name:  "translate-to-french",
        Input: map[string]interface{}{
            "message": "Hello world",
            "userId":  123,
            "instructions": "Convert the provided input into french",
        },
        Mode: "sync",
        ResponseObject: StructuredOutput{
            Title: "",
            Body:  "",
        },
        Metadata: map[string]interface{}{
            "requestId": "abc-123",
        },
    })

    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("result %+v\n", result)
    // result {Body:Bonjour Title:Ceci est une charge utile de test}
}
```

## Python

```bash
pip install meldai-sdk
```

```python
import os
from meldai import MeldClient, MeldClientOptions, EnsureAndRunWebhookOptions

def main():
    client = MeldClient(MeldClientOptions(api_key=os.getenv("MELD_API_KEY")))
    
    class StructuredOutput:
        def __init__(self, body: str, title: str):
            self.body = body
            self.title = title
    
    result = client.melds.ensure_and_run_webhook(EnsureAndRunWebhookOptions(
        name="translate-to-french",
        input={
            "message": "Hello world", 
            "userId": 123,
            "instructions": "Convert the provided input into french"
        },
        mode="sync",
        response_object=StructuredOutput(title="", body=""),
        metadata={"requestId": "abc-123"},
    ))
    
    print('result', result)
    # result {'title': 'Bonjour', 'body': 'Ceci est une charge utile de test'}

if __name__ == "__main__":
    main()
```

## Available SDKs

- **TypeScript/JavaScript**: `@meldai/sdk` - [Documentation](packages/sdk/README.md)
- **Python**: `meldai-sdk` - [Documentation](packages/python/README.md)  
- **Go**: `github.com/meld-ai/meldai-core/go-sdk` - [Documentation](packages/go/README.md)

## Development

Each SDK is independent and can be developed separately. See the individual README files for development instructions.

## License

MIT © 2025