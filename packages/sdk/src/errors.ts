export class MeldAPIError extends Error {
  public status: number;
  public runId?: string | null;
  public data?: unknown;

  constructor(
    message: string,
    options?: { status?: number; runId?: string | null; data?: unknown }
  ) {
    super(message);
    this.name = 'MeldAPIError';
    this.status = options?.status ?? 0;
    this.runId = options?.runId ?? null;
    this.data = options?.data;
  }
}
