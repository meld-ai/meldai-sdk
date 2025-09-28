import { jest } from '@jest/globals';
import { MeldClient } from '../src/client';
import { MeldAPIError } from '../src/errors';
import { z } from 'zod';

const mockFetch = (global as any).fetch as jest.MockedFunction<typeof fetch>;

describe('client.melds.ensureAndRunWebhook', () => {
  const mockResponse = { title: 'Test', body: 'Test body' };
  const schema = z.object({ title: z.string(), body: z.string() });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse) as never)
    } as any);
  });

  it('runs with template and sync mode', async () => {
    const client = new MeldClient({ apiKey: 'test-key' });
    const result = await client.melds.ensureAndRunWebhook({
      name: 'translate-to-french',
      template: { instructions: 'Convert text to formal French.' },
      responseObject: schema,
      input: { text: 'Hello world' },
      mode: 'sync',
    });
    expect(result).toEqual(mockResponse);
  });

  it('runs without template and sync mode', async () => {
    const client = new MeldClient({ apiKey: 'test-key' });
    const result = await client.melds.ensureAndRunWebhook({
      name: 'translate-to-french',
      responseObject: { translation: '' },
      input: { text: 'Good morning!' },
      mode: 'sync',
    });
    expect(result).toEqual(mockResponse);
  });

  it('runs with template and async mode (requires callbackUrl)', async () => {
    const client = new MeldClient({ apiKey: 'test-key' });
    const result = await client.melds.ensureAndRunWebhook({
      name: 'translate-to-french',
      template: { instructions: 'Convert text to formal French.' },
      responseObject: schema,
      input: { text: 'Hello world' },
      mode: 'async',
      callbackUrl: 'https://example.com/cb',
    });
    expect(result).toEqual(mockResponse);
  });

  it('throws error for async mode without callbackUrl', async () => {
    const client = new MeldClient({ apiKey: 'test-key' });
    await expect(client.melds.ensureAndRunWebhook({
      name: 'translate-to-french',
      input: { text: 'Good morning!' },
      responseObject: { translation: '' },
      mode: 'async',
    })).rejects.toThrow('callbackUrl is required for async mode');
  });

  it('uses default base URL', async () => {
    const client = new MeldClient({ apiKey: 'test-key' });
    await client.melds.ensureAndRunWebhook({
      name: 'test',
      input: { a: 1 },
      responseObject: z.any(),
      mode: 'sync',
    });
    expect(mockFetch).toHaveBeenCalledWith('https://sdk-api.meld.ai//api/v1/meld-run/sync', expect.any(Object));
  });

  it('uses localhost endpoint format', async () => {
    const client = new MeldClient({ apiKey: 'test-key', baseUrl: 'http://localhost:3000' });
    await client.melds.ensureAndRunWebhook({
      name: 'test',
      input: { a: 1 },
      responseObject: z.any(),
      mode: 'sync',
    });
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/v1/meld-run/sync', expect.any(Object));
  });

  it('handles API errors', async () => {
    const errorResponse = { message: 'API Error', statusCode: 400 };
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers({
        'content-type': 'application/json',
        'X-Run-Id': 'req-123',
      }),
      text: jest.fn().mockResolvedValue(JSON.stringify(errorResponse) as never),
    } as any);

    const client = new MeldClient({ apiKey: 'test-key' });
    await expect(client.melds.ensureAndRunWebhook({
      name: 'test',
      input: { a: 1 },
      responseObject: z.any(),
      mode: 'sync',
    })).rejects.toThrow(MeldAPIError);
  });
});