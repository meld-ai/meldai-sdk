import { Mode } from '@meldai/shared';

/**
 * Configuration options for running a Meld workflow
 * @template T The expected type of the response object
 */
export type RunMeldOptions<T> = {
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
  responseObject: T;

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
   * @default 60000 (60 seconds)
   * @example 30000
   */
  timeoutMs?: number;
};
