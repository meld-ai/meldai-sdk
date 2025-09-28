import { MeldsResource } from './resources/melds';
import { MeldAPIError } from './errors';

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
 * const result = await client.melds.buildAndRun<MyResultType>({
 *   name: 'meld_123',
 *   input: { 
 *     text: 'Hello world',
 *     instructions: 'Extract keywords'
 *   },
 *   mode: 'sync',
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

  /** Melds resource for managing Meld workflows */
  public readonly melds: MeldsResource;

  constructor(opts: MeldClientOptions = {}) {
    this.apiKey = opts.apiKey ?? process.env.MELD_API_KEY ?? null;
    this.baseUrl = opts.baseUrl ?? DEFAULT_BASE_URL;
    this.defaultTimeout = opts.timeoutMs ?? 60_000;
    this._fetch = opts.fetch ?? globalThis.fetch.bind(globalThis);

    // Initialize resources
    this.melds = new MeldsResource(this);
  }

  /** @internal Get API key for resource classes */
  _getApiKey(): string | null {
    return this.apiKey ?? process.env.MELD_API_KEY ?? null;
  }

  /** @internal Get default timeout for resource classes */
  _getDefaultTimeout(): number {
    return this.defaultTimeout;
  }

  /** @internal Get fetch implementation for resource classes */
  _getFetch(): typeof globalThis.fetch {
    return this._fetch;
  }

  /** @internal Get base URL for resource classes */
  _getBaseUrl(): string {
    return this.baseUrl;
  }

  /** @internal Get auth headers (throws if API key missing) */
  _getAuthHeaders(): Record<string, string> {
    const apiKey = this.apiKey ?? process.env.MELD_API_KEY ?? null;
    if (!apiKey) {
      throw new Error('Missing API key. Pass apiKey or set MELD_API_KEY.');
    }
    return {
      Authorization: `Bearer ${apiKey}`,
      'X-Meld-Client': '@meldai/sdk',
    };
  }

  /** @internal Perform HTTP request with timeout, auth, and standard error handling */
  async _request<T>(
    url: string,
    init: RequestInit & { headers?: Record<string, string> } = {},
    timeoutMs?: number,
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = timeoutMs ?? this.defaultTimeout;
    const id = setTimeout(() => controller.abort(), timeout);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this._getAuthHeaders(),
      ...(init.headers as Record<string, string> | undefined ?? {}),
    };

    try {
      const res = await this._fetch(url, {
        ...init,
        headers,
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
