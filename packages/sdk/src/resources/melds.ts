import type { ZodTypeAny } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ZodType } from 'zod';
import type { MeldClient } from '../client';
import { MeldAPIError } from '../errors';

/**
 * Melds resource for managing Meld workflows
 */
/**
 * Options for running an existing webhook by pinned ID
 */

export type RunWebhookOptions = {
  meldId: string;
  payload?: Record<string, unknown>;
  timeoutMs?: number;
};

/**
 * Options to ensure (create/update) a meld by name using an optional template, then run it.
 * responseObject is required; template can be any JSON object.
 */
export type EnsureAndRunWebhookOptions = {
  /** Name of the meld to ensure and then run */
  name: string;
  /** Input payload for the run */
  input: Record<string, unknown>;
  /** Execution mode */
  mode: 'sync' | 'async'; // default: sync
  /** Expected response schema or plain JSON shape */
  responseObject: ZodTypeAny | Record<string, unknown>;
  /** Optional declarative template (any JSON) to ensure/update the meld */
  template?: Record<string, unknown>;
  /** Optional callback URL (used for async mode) */
  callbackUrl?: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
  /** Optional timeout override */
  timeoutMs?: number;
};

export class MeldsResource {
  constructor(private client: MeldClient) { }

  async ensureAndRunWebhook<T>(options: EnsureAndRunWebhookOptions): Promise<T> {
    const timeout = options.timeoutMs ?? this.client._getDefaultTimeout();

    const baseUrl = this.client._getBaseUrl();
    const url = baseUrl.includes('localhost')
      ? `${baseUrl}/v1/meld-run`
      : `${baseUrl}/api/v1/meld-run`;

    const isSync = options.mode === 'async' ? false : true;
    const endpoint = isSync ? `${url}/sync` : url;

    if (options.mode === 'async' && !options.callbackUrl) {
      throw new MeldAPIError('callbackUrl is required for async mode');
    }

    let responseObjectForAPI: unknown;
    if (options.responseObject instanceof ZodType) {
      responseObjectForAPI = zodToJsonSchema(options.responseObject, 'responseObject');
    } else {
      responseObjectForAPI = options.responseObject;
    }

    return this.client._request<T>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify({
          name: options.name,
          input: options.input,
          responseObject: responseObjectForAPI,
          template: options.template,
          callbackUrl: 'callbackUrl' in options ? options.callbackUrl : undefined,
          metadata: 'metadata' in options ? options.metadata : undefined,
        }),
      },
      timeout,
    );
  }
}
