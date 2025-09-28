import { jest } from '@jest/globals';
import { MeldClient } from '../src/client';
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
});