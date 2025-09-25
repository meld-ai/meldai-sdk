# @meldai/sdk

> Official TypeScript SDK for **Meld.ai** — your all-in-one toolkit for building with AI.

Go from duct-taped prompts to durable AI systems — fast. Meld is your workbench for designing, controlling, collaborating & deploying AI systems with confidence. This SDK lets you programmatically run your Melds (AI workflows) with full observability and type safety.

- **Simple API**: Single call `runMeld<T>(options)` to execute your AI workflows
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

const result = await client.runMeld<TranslationResult>({
  meldId: "translate-to-french",
  instructions: "Convert the provided input into french",
  input: { message: "Hello world", userId: 123 },
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

const result = await client.runMeld<MyResponse>({
  meldId: "translate-to-french",
  instructions: "Convert the provided input into french",
  input: { message: "Hello world", userId: 123 },
  responseObject: { title: "string", body: "string" }, // Plain object descriptor
  metadata: { requestId: "abc-123" },
});

console.log('result', result);
// Output: { title: "Bonjour", body: "Ceci est une charge utile de test" }
// Typed but not validated
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

#### `runMeld<T>(options: RunMeldOptions): Promise<T>`

```ts
export type RunMeldOptions = {
  /** Unique identifier of the Meld workflow to execute */
  meldId: string;
  
  /** Natural language instructions for the AI workflow */
  instructions: string;
  
  /** Input data to be processed by the Meld workflow */
  input: Record<string, unknown>;
  
  /** 
   * Either a Zod schema for validation/inference, or any JSON object 
   * to describe the expected shape without validation 
   */
  responseObject: ZodTypeAny | Record<string, unknown>;
  
  /** Additional metadata to be included in the request */
  metadata: Record<string, unknown>;
  
  /** Optional callback URL for asynchronous execution */
  callbackUrl?: string;
  
  /** Execution mode for the workflow */
  mode?: 'sync' | 'async';
  
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
  await client.runMeld({
    meldId: "my-workflow",
    instructions: "Process this data",
    input: { data: "test" },
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
await client.runMeld({
  meldId: "long-running-workflow",
  instructions: "Process large dataset",
  input: { dataset: "..." },
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