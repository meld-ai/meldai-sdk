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

```ts
import { MeldClient } from "@meldai/sdk";

const client = new MeldClient({ apiKey: process.env.MELD_API_KEY });

const main = async () => {

  type StructuredOutput = { body: string, title: string };

  const result = await client.runMeld<StructuredOutput>({
    meldId: "translate-to-french",
    instructions: "Convert the provided input into french",
    responseObject: { title: "Hello", body: "This is a test payload" },
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

    result, err := client.RunMeld(context.Background(), meld.RunMeldOptions[StructuredOutput]{
        MeldId:       "translate-to-french",
        Instructions: "Convert the provided input into french",
        ResponseObject: StructuredOutput{
            Title: "Hello",
            Body:  "This is a test payload",
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
from meldai import MeldClient, MeldClientOptions, RunMeldOptions

def main():
    client = MeldClient(MeldClientOptions(api_key=os.getenv("MELD_API_KEY")))
    
    class StructuredOutput:
        def __init__(self, body: str, title: str):
            self.body = body
            self.title = title
    
    result = client.run_meld(RunMeldOptions(
        meld_id="translate-to-french",
        instructions="Convert the provided input into french",
        response_object=StructuredOutput(title="Hello", body="This is a test payload"),
    ))
    
    print('result', result)
    # result {'title': 'Bonjour', 'body': 'Ceci est une charge utile de test'}

if __name__ == "__main__":
    main()
```

## Available SDKs

- **TypeScript/JavaScript**: `@meldai/sdk` - [Documentation](typescript/README.md)
- **Python**: `meldai-sdk` - [Documentation](python/README.md)  
- **Go**: `github.com/meld-ai/meldai-core/go-sdk` - [Documentation](go/README.md)

## Development

Each SDK is independent and can be developed separately. See the individual README files for development instructions.

## License

MIT © 2025