
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
  details?: Record<string, unknown>;
}
