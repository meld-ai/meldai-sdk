import type { ZodTypeAny } from 'zod';

/**
 * Execution mode for Meld workflows
 */
export type Mode = 'sync' | 'async';

/**
 * Common status values used across Meld packages
 */
export type Status = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Base configuration that can be shared across packages
 */
export interface BaseConfig {
  /** 
   * The execution mode for the workflow
   * @default 'sync'
   */
  mode?: Mode;

  /** 
   * Current status of the operation
   */
  status?: Status;

  /** 
   * Unique identifier for tracking runs
   */
  runId?: string;

  /** 
   * Timestamp when the operation was created
   */
  createdAt?: string;

  /** 
   * Timestamp when the operation was last updated
   */
  updatedAt?: string;
}

/**
 * Common error structure used across packages
 */
export interface BaseError {
  /** Error message */
  message: string;

  /** Error code for programmatic handling */
  code?: string;

  /** HTTP status code if applicable */
  status?: number;

  /** Additional error details */
  details?: Record<string, any>;
}

/**
 * Configuration options for running a Meld workflow
 */
export type RunMeldOptions = {
  /** 
   * The unique identifier of the Meld workflow to execute
   * @example "translate-to-french"
   */
  meldId: string;

  /** 
   * Natural language instructions for the AI workflow
   * @example "Convert this text to French and make it more formal"
   */
  instructions: string;

  /** 
   * The input data to be processed by the Meld workflow
   * @example { message: "Hello world", userId: 123 }
   */
  input: Record<string, unknown>;

  /** 
   * Either a Zod schema for validation/inference, or any JSON object to describe the expected shape without validation
   * @example z.object({ key: z.array(z.string()) })
   * @example { key: ['value1', 'value2'] }
   */
  responseObject: ZodTypeAny | Record<string, unknown>;

  /**
   * Additional metadata to be included in the request
   * @example { userId: 123 }
   */
  metadata?: Record<string, unknown>;

  /** 
   * Optional callback URL for asynchronous execution
   * When provided, the workflow runs asynchronously and results are sent to this URL
   * @example "https://your-app.com/webhook/meld-callback"
   */
  callbackUrl?: string;

  /** 
   * Execution mode for the workflow
   * @default 'sync' (determined by callbackUrl presence)
   * @example 'async'
   */
  mode?: Mode;

  /** 
   * Optional timeout in milliseconds (overrides client default)
   * @default 60_000 (60 seconds)
   * @example 30_000
   */
  timeoutMs?: number;
};
