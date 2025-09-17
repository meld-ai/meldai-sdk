import { RunMeldOptions } from './types';
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
   * @default "https://app.meld.ai"
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
const DEFAULT_BASE_URL = 'https://app.meld.ai';

/**
 * Main client for interacting with the Meld.ai API
 * 
 * @example
 * ```typescript
 * const client = new MeldClient({
 *   apiKey: process.env.MELD_API_KEY,
 *   baseUrl: 'https://app.meld.ai'
 * });
 * 
 * const result = await client.runMeld({
 *   meldId: 'meld_123',
 *   instructions: 'Convert to French',
 *   responseObject: { text: 'Hello world' }
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

  async runMeld<T>(options: RunMeldOptions<T>): Promise<T> {
    const apiKey = this.apiKey ?? process.env.MELD_API_KEY ?? null;
    if (!apiKey) {
      throw new Error('Missing API key. Pass apiKey or set MELD_API_KEY.');
    }

    const timeout = options.timeoutMs ?? this.defaultTimeout;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    // Determine endpoint based on callbackUrl presence
    const endpoint = options.callbackUrl
      ? `${this.baseUrl}/api/v1/meld-run`
      : `${this.baseUrl}/api/v1/meld-run/sync`;

    try {
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
          inputObject: options.responseObject,
          callbackUrl: options.callbackUrl,
        }),
        signal: controller.signal,
      });

      const text = await res.text();
      const contentType = res.headers.get('content-type') ?? '';
      const maybeJson = contentType.includes('application/json');
      const data = maybeJson && text ? JSON.parse(text) : text;

      if (!res.ok) {
        throw new MeldAPIError(
          typeof (data as any)?.message === 'string'
            ? (data as any).message
            : `Meld API request failed with status ${res.status}`,
          {
            status: res.status,
            runId: res.headers.get('X-Run-Id'),
            data,
          }
        );
      }

      return data as T;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw new MeldAPIError('Request timed out', { status: 408 });
      }
      throw err;
    } finally {
      clearTimeout(id);
    }
  }
}
