# @meldai/sdk

> Official TypeScript SDK for **Meld.ai** — your all-in-one toolkit for building with AI.

Go from duct-taped prompts to durable AI systems — fast. Meld is your workbench for designing, controlling, collaborating & deploying AI systems with confidence. This SDK lets you programmatically run your Melds (AI workflows) with full observability and type safety.

- **Resource-based API**: Clean resource structure with `client.melds.ensureAndRunWebhook<T>(options)` to execute your AI workflows
- **Zod Integration**: Use Zod schemas for automatic validation and type inference
- **Sync & Async**: Retrieve results synchronously or asynchronously with a callbackUrl
- **Type Safety**: Full TypeScript support with strict typing for inputs and outputs  
- **Production Ready**: Pure TypeScript compilation with .d.ts files, bare bones runtime deps, enterprise-grade reliability
- **Flexible Auth**: Environment-based (`MELD_API_KEY`) or explicit API key configuration

## Install

```bash
npm install @meldai/sdk
# or
pnpm add @meldai/sdk
# or
yarn add @meldai/sdk
```

> Requires **Node.js ≥ 18** (native `fetch`).

## Quickstart

### Using Zod Schemas (Recommended)

```ts
import { MeldClient } from "@meldai/sdk";
import { z } from "zod";

const client = new MeldClient({ apiKey: process.env.MELD_API_KEY });

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
// Output: { title: "Bonjour", body: "Ceci est une charge utile de test" }
// Fully typed and validated!
```

### Using Plain Objects

```ts
import { MeldClient } from "@meldai/sdk";

const client = new MeldClient({ apiKey: process.env.MELD_API_KEY });

type MyResponse = { title: string; body: string };

const result = await client.melds.ensureAndRunWebhook<MyResponse>({
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

console.log('result', result);
// Output: { title: "Bonjour", body: "Ceci est une charge utile de test" }
// Typed but not validated
```

### Async with Callback URL

```ts
import { MeldClient } from "@meldai/sdk";

const client = new MeldClient({ apiKey: process.env.MELD_API_KEY });

// For long-running workflows, use async mode
await client.melds.ensureAndRunWebhook({
  name: "translate-to-french",
  input: { 
    message: "Hello world", 
    userId: 123,
    instructions: "Convert the provided input into french"
  },
  mode: "async",
  responseObject: { title: "string", body: "string" },
  callbackUrl: "https://your-app.com/webhook/meld-callback",
  metadata: { requestId: "abc-123" },
});
// Returns immediately, results will be sent to your callback URL
```

## API

### `class MeldClient`

```ts
new MeldClient(options?: {
  apiKey?: string | null;            // default: process.env.MELD_API_KEY
  baseUrl?: string;                  // default: https://sdk-api.meld.ai/
  timeoutMs?: number;                // default: 60_000
  fetch?: typeof globalThis.fetch;   // default: global fetch
});
```

#### `client.melds.ensureAndRunWebhook<T>(options: EnsureAndRunWebhookOptions): Promise<T>`

```ts
export type EnsureAndRunWebhookOptions = {
  /** Name of the meld to ensure and then run */
  name: string;
  
  /** Input data to be processed by the Meld workflow */
  input: Record<string, unknown>;
  
  /** Execution mode for the workflow */
  mode: 'sync' | 'async';
  
  /** 
   * Either a Zod schema for validation/inference, or any JSON object 
   * to describe the expected shape without validation 
   */
  responseObject: ZodTypeAny | Record<string, unknown>;
  
  /** Optional declarative template (any JSON) to ensure/update the meld */
  template?: Record<string, unknown>;
  
  /** Optional callback URL (required for async mode) */
  callbackUrl?: string;
  
  /** Optional metadata to be included in the request */
  metadata?: Record<string, unknown>;
  
  /** Optional timeout in milliseconds (overrides client default) */
  timeoutMs?: number;
};
```

## How it Works

### Zod Schema Conversion

When you pass a Zod schema as `responseObject`:

1. **Client-side**: The Zod schema is converted to JSON Schema format using `zod-to-json-schema`
2. **API Call**: The JSON Schema is sent to the Meld API to guide response generation
3. **Response**: The API returns JSON data matching your schema structure
4. **Validation**: The response is validated against your original Zod schema
5. **Type Safety**: You get full TypeScript type inference from `z.infer<typeof schema>`

### Plain Object Descriptors

When you pass a plain object as `responseObject`:

1. **API Call**: The object is sent as-is to describe the expected response shape
2. **Response**: The API returns JSON data
3. **No Validation**: Raw response data is returned without validation
4. **Type Safety**: You specify the return type manually with the generic `<T>`

## Error handling

Non‑2xx responses throw `MeldAPIError`:

```ts
import { MeldAPIError } from "@meldai/sdk";

try {
  await client.melds.ensureAndRunWebhook({
    name: "my-workflow",
    input: { 
      data: "test",
      instructions: "Process this data"
    },
    mode: "sync",
    responseObject: mySchema,
    metadata: {},
  });
} catch (err) {
  if (err instanceof MeldAPIError) {
    console.error(err.status, err.message, err.data);
  } else {
    throw err;
  }
}
```

The error carries:
- `status` (HTTP status code)
- `message` (best‑effort message)
- `runId` (if the server returns `x-run-id`)
- `data` (parsed JSON body when available)

## Async Execution

For long-running workflows, use async mode with a callback URL:

```ts
await client.melds.ensureAndRunWebhook({
  name: "long-running-workflow",
  input: { 
    dataset: "...",
    instructions: "Process large dataset"
  },
  mode: "async",
  responseObject: resultSchema,
  metadata: { userId: 123 },
  callbackUrl: "https://your-app.com/webhook/meld-callback",
});
// Returns immediately, results sent to callback URL
```

## Examples

See `scripts/example.ts` for complete working examples with both Zod schemas and plain objects.

## Development

```bash
pnpm install
pnpm run build
pnpm run lint
pnpm run format
pnpm test
pnpm run example
```

## License

MIT © 2025