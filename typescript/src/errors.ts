export class MeldAPIError extends Error {
  public status: number;
  public requestId?: string | null;
  public data?: unknown;

  constructor(
    message: string,
    options: { status: number; requestId?: string | null; data?: unknown }
  ) {
    super(message);
    this.name = "MeldAPIError";
    this.status = options.status;
    this.requestId = options.requestId ?? null;
    this.data = options.data;
  }
}
