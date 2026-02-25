import { describe, expect, it, vi, beforeEach } from 'vitest';

const resolveUrlPreviewMock = vi.fn();

vi.mock('../resolver', () => ({
  resolveUrlPreview: (...args: unknown[]) => resolveUrlPreviewMock(...args),
}));

import { createNextRouteHandler } from './next';

describe('createNextRouteHandler', () => {
  beforeEach(() => {
    resolveUrlPreviewMock.mockReset();
  });

  it('provides an OPTIONS handler for CORS preflight', async () => {
    const handler = createNextRouteHandler();
    const response = await handler.OPTIONS(new Request('https://app.test/api/preview'));

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
  });

  it('returns 400 when url query parameter is missing', async () => {
    const handler = createNextRouteHandler();
    const response = await handler(new Request('https://app.test/api/preview'));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error?.code).toBe('MISSING_URL');
  });
});
