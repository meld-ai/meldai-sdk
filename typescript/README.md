# @meldai/sdk

> Official TypeScript SDK for **Meld.ai** — your all-in-one toolkit for building with AI.

Go from duct-taped prompts to durable AI systems — fast. Meld is your workbench for designing, controlling, collaborating & deploying AI systems with confidence. This SDK lets you programmatically run your Melds (AI workflows) with full observability and type safety.

- **Simple API**: Single call `runMeld<T>(options)` to execute your AI workflows
- **Sync & Async**: Retrieve results synchronously or asynchronously with a callbackUrl.
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

```ts
import { MeldClient } from "@meldai/sdk";

const client = new MeldClient({ apiKey: process.env.MELD_API_KEY });

type StructuredOutput = { body: string, title: string };

const result = await client.runMeld<StructuredOutput>({
  instructions: "Convert the provided input into french",
  responseObject: { title: "Hello", body: "This is a test payload" },
});

console.log('result', result);
// Output: { title: "Bonjour", body: "Ceci est une charge utile de test" }
```

## API

### `class MeldClient`

```ts
new MeldClient(options?: {
  apiKey?: string | null;            // default: process.env.MELD_API_KEY
  baseUrl?: string;                  // default: hardcoded endpoint
  timeoutMs?: number;                // default: 60_000
  fetch?: typeof globalThis.fetch;   // default: global fetch
});
```

#### `runMeld<T>(options: RunMeldOptions<T>): Promise<T>`

```ts
export type RunMeldOptions<T> = {
  instructions: string;
  responseObject: T;
  callbackUrl?: string;
  timeoutMs?: number;
};
```

## Error handling

Non‑2xx responses throw `MeldAPIError`:

```ts
try {
  await client.runMeld({ instructions: "…", responseObject: { … } });
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

## Examples

See `example.ts` for a complete working example.

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
