export type RunMeldOptions<T> = {
  meldId: string;
  instructions: string;
  responseObject: T;
  callbackUrl?: string;
  timeoutMs?: number;
};
