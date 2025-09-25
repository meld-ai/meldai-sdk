import { RunMeldOptions } from './types';
import { MeldAPIError } from './errors';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ZodType } from 'zod';

/**
 * Configuration options for the Meld client
 */
export type MeldClientOptions = {
  /** 
   * Your Meld API key. If not provided, will use MELD_API_KEY environment variable
   * @example "meld_sk_1234567890abcdef"
   */
  apiKey?: string | null;

  /** 
   * Base URL for the Meld API. Useful for local development or custom deployments
   * @default "https://sdk-api.meld.ai"
   * @example "http://localhost:3000"
   */
  baseUrl?: string;

  /** 
   * Default timeout in milliseconds for all requests
   * @default 60000 (60 seconds)
   * @example 30000
   */
  timeoutMs?: number;

  /** 
   * Custom fetch implementation. Useful for testing or custom HTTP behavior
   * @default globalThis.fetch
   */
  fetch?: typeof globalThis.fetch;
};

/** Default base URL for the Meld API */
export const DEFAULT_BASE_URL = 'https://sdk-api.meld.ai/';

/**
 * Main client for interacting with the Meld.ai API
 * 
 * @example
 * ```typescript
 * const client = new MeldClient({
 *   apiKey: process.env.MELD_API_KEY,
 * });
 * 
 * const schema = z.object({ key: z.array(z.string()) });
 * const result = await client.runMeld<MyResultType>({
 *   meldId: 'meld_123',
 *   instructions: 'Extract keywords',
 *   input: { text: 'Hello world' },
 *   responseObject: schema,
 *   metadata: { userId: 123 },
 * });
 * ```
 */
export class MeldClient {
  private apiKey: string | null;
  private baseUrl: string;
  private defaultTimeout: number;
  private _fetch: typeof globalThis.fetch;

  constructor(opts: MeldClientOptions = {}) {
    this.apiKey = opts.apiKey ?? process.env.MELD_API_KEY ?? null;
    this.baseUrl = opts.baseUrl ?? DEFAULT_BASE_URL;
    this.defaultTimeout = opts.timeoutMs ?? 60_000;
    this._fetch = opts.fetch ?? globalThis.fetch.bind(globalThis);
  }

  async runMeld<T>(options: RunMeldOptions): Promise<T> {
    const apiKey = this.apiKey ?? process.env.MELD_API_KEY ?? null;
    if (!apiKey) {
      throw new Error('Missing API key. Pass apiKey or set MELD_API_KEY.');
    }

    const timeout = options.timeoutMs ?? this.defaultTimeout;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const formatEndpointWithApi = () => {
      if (this.baseUrl.includes('localhost')) {
        return `${this.baseUrl}/v1/meld-run`;
      }
      return `${this.baseUrl}/api/v1/meld-run`;
    }

    const url = formatEndpointWithApi()

    // Determine endpoint based on callbackUrl presence
    const endpoint = options.callbackUrl
      ? `${url}`
      : `${url}/sync`;

    try {
      let responseObjectForAPI: any;
      if (options.responseObject instanceof ZodType) {
        const zodSchema = zodToJsonSchema(options.responseObject, 'responseObject');
        responseObjectForAPI = zodSchema;
      } else {
        responseObjectForAPI = options.responseObject;
      }

      const res = await this._fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'X-Meld-Client': '@meldai/sdk',
        },
        body: JSON.stringify({
          meldId: options.meldId,
          instructions: options.instructions,
          input: options.input,
          responseObject: responseObjectForAPI,
          callbackUrl: options.callbackUrl,
          metadata: options.metadata,
        }),
        signal: controller.signal,
      });

      const text = await res.text();

      const contentType = res.headers.get('content-type') ?? '';
      const rawData = contentType.includes('application/json') && text ? JSON.parse(text) : text;

      if (!res.ok) {
        throw new MeldAPIError(
          typeof (rawData as any)?.message === 'string'
            ? (rawData as any).message
            : `Meld API request failed with status ${res.status}`,
          {
            status: res.status,
            runId: res.headers.get('X-Run-Id'),
            data: rawData,
          }
        );
      }

      return rawData as T;
    } catch (err) {
      if ((err as any)?.name === 'AbortError') {
        throw new MeldAPIError('Request timed out', { status: 408 });
      }
      throw err;
    } finally {
      clearTimeout(id);
    }
  }
}
