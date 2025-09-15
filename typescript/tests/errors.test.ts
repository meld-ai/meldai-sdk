import { MeldAPIError } from '../src/errors';

describe('MeldAPIError', () => {
  it('should create error with message only', () => {
    const error = new MeldAPIError('Test error');

    expect(error.message).toBe('Test error');
    expect(error.status).toBe(0);
    expect(error.runId).toBeNull();
    expect(error.data).toBeUndefined();
  });

  it('should create error with all properties', () => {
    const errorData = { code: 'INVALID_REQUEST' };
    const error = new MeldAPIError('Test error', {
      status: 400,
      runId: 'req-123',
      data: errorData,
    });

    expect(error.message).toBe('Test error');
    expect(error.status).toBe(400);
    expect(error.runId).toBe('req-123');
    expect(error.data).toEqual(errorData);
  });

  it('should be instance of Error', () => {
    const error = new MeldAPIError('Test error');
    expect(error).toBeInstanceOf(Error);
  });

  it('should have correct name', () => {
    const error = new MeldAPIError('Test error');
    expect(error.name).toBe('MeldAPIError');
  });
});
