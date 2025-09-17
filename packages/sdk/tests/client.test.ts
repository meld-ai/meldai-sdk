import { jest } from '@jest/globals';
import { MeldClient } from '../src/client';
import { MeldAPIError } from '../src/errors';

// Mock fetch
const mockFetch = (global as any).fetch as jest.MockedFunction<typeof fetch>;

describe('MeldClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.MELD_API_KEY;
  });

  describe('constructor', () => {
    it('should use default options when none provided', () => {
      const client = new MeldClient();
      expect(client).toBeInstanceOf(MeldClient);
    });

    it('should use provided apiKey', () => {
      const client = new MeldClient({ apiKey: 'test-key' });
      expect(client).toBeInstanceOf(MeldClient);
    });

    it('should use environment variable when apiKey not provided', () => {
      process.env.MELD_API_KEY = 'env-key';
      const client = new MeldClient();
      expect(client).toBeInstanceOf(MeldClient);
    });

    it('should use custom baseUrl', () => {
      const client = new MeldClient({
        apiKey: 'test-key',
        baseUrl: 'https://custom.example.com'
      });
      expect(client).toBeInstanceOf(MeldClient);
    });

    it('should use custom timeout', () => {
      const client = new MeldClient({
        apiKey: 'test-key',
        timeoutMs: 30000
      });
      expect(client).toBeInstanceOf(MeldClient);
    });
  });

  describe('runMeld', () => {
    const mockResponse = { title: 'Test', body: 'Test body' };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json',
        }),
        text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse) as never)
      } as any);
    });

    it('should make successful API call', async () => {
      const client = new MeldClient({ apiKey: 'test-key' });

      const result = await client.runMeld({
        meldId: 'test-meld',
        instructions: 'Test instructions',
        responseObject: { input: 'test' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://app.meld.ai/api/v1/run-meld/sync',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-key',
            'X-Meld-Client': '@meldai/sdk/1.0.0',
          }),
          body: JSON.stringify({
            meldId: 'test-meld',
            instructions: 'Test instructions',
            inputObject: { input: 'test' },
            callbackUrl: undefined,
          }),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should use callback endpoint when callbackUrl provided', async () => {
      const client = new MeldClient({ apiKey: 'test-key' });

      await client.runMeld({
        meldId: 'test-meld',
        instructions: 'Test instructions',
        responseObject: { input: 'test' },
        callbackUrl: 'https://callback.example.com',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://app.meld.ai/api/v1/run-meld',
        expect.any(Object)
      );
    });

    it('should use custom baseUrl', async () => {
      const client = new MeldClient({
        apiKey: 'test-key',
        baseUrl: 'https://custom.example.com'
      });

      await client.runMeld({
        meldId: 'test-meld',
        instructions: 'Test instructions',
        responseObject: { input: 'test' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://custom.example.com/api/v1/run-meld/sync',
        expect.any(Object)
      );
    });

    it('should throw error when apiKey is missing', async () => {
      const client = new MeldClient();

      await expect(client.runMeld({
        meldId: 'test-meld',
        instructions: 'Test instructions',
        responseObject: { input: 'test' },
      })).rejects.toThrow('Missing API key. Pass apiKey or set MELD_API_KEY.');
    });

    it('should throw MeldAPIError on API error', async () => {
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

      await expect(client.runMeld({
        meldId: 'test-meld',
        instructions: 'Test instructions',
        responseObject: { input: 'test' },
      })).rejects.toThrow(MeldAPIError);
    });

    it('should handle timeout', async () => {
      mockFetch.mockImplementation(() =>
        new Promise((_, reject) => {
          setTimeout(() => {
            const error = new Error('Request timed out');
            error.name = 'AbortError';
            reject(error);
          }, 100);
        })
      );

      const client = new MeldClient({
        apiKey: 'test-key',
        timeoutMs: 50
      });

      await expect(client.runMeld({
        meldId: 'test-meld',
        instructions: 'Test instructions',
        responseObject: { input: 'test' },
      })).rejects.toThrow(MeldAPIError);
    });

    it('should handle non-JSON response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'text/plain',
        }),
        text: jest.fn().mockResolvedValue('plain text response' as never),
      } as any);

      const client = new MeldClient({ apiKey: 'test-key' });

      const result = await client.runMeld({
        meldId: 'test-meld',
        instructions: 'Test instructions',
        responseObject: { input: 'test' },
      });

      expect(result).toBe('plain text response');
    });

    it('should use environment variable for apiKey', async () => {
      process.env.MELD_API_KEY = 'env-key';
      const client = new MeldClient();

      await client.runMeld({
        meldId: 'test-meld',
        instructions: 'Test instructions',
        responseObject: { input: 'test' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer env-key',
          }),
        })
      );
    });
  });
});
