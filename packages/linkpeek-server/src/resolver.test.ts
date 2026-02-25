import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchUrlMock = vi.fn();
const parseHtmlMock = vi.fn();

vi.mock('./fetcher', () => ({
  fetchUrl: (...args: unknown[]) => fetchUrlMock(...args),
  FetchError: class FetchError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  },
}));

vi.mock('./parser', () => ({
  parseHtml: (...args: unknown[]) => parseHtmlMock(...args),
}));

import { resolveUrlPreview } from './resolver';

describe('resolveUrlPreview cache isolation', () => {
  beforeEach(() => {
    fetchUrlMock.mockReset();
    parseHtmlMock.mockReset();
  });

  it('does not reuse cache entries across different cache configs', async () => {
    fetchUrlMock.mockResolvedValueOnce({
      html: '<html><title>one</title></html>',
      finalUrl: 'https://example.com',
    });
    parseHtmlMock.mockReturnValueOnce({
      url: 'https://example.com',
      title: 'first',
    });

    await resolveUrlPreview('https://example.com', {
      cache: { enabled: true, max: 1, ttlMs: 60_000 },
    });
    expect(fetchUrlMock).toHaveBeenCalledTimes(1);

    fetchUrlMock.mockResolvedValueOnce({
      html: '<html><title>two</title></html>',
      finalUrl: 'https://example.com',
    });
    parseHtmlMock.mockReturnValueOnce({
      url: 'https://example.com',
      title: 'second',
    });

    await resolveUrlPreview('https://example.com', {
      cache: { enabled: true, max: 2, ttlMs: 60_000 },
    });

    expect(fetchUrlMock).toHaveBeenCalledTimes(2);
  });
});
