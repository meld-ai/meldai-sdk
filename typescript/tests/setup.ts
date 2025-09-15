// Global test setup
import { jest } from '@jest/globals';

// Mock fetch globally
(global as any).fetch = jest.fn();

// Mock process.env
const originalEnv = process.env;

beforeEach(() => {
  jest.clearAllMocks();
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});
