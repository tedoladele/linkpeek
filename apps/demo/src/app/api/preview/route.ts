import { createNextRouteHandler } from 'linkpeek-server';

const handler = createNextRouteHandler({
  timeoutMs: 5000,
  maxBytes: 1_000_000,
  cache: { enabled: true, ttlMs: 24 * 60 * 60 * 1000, max: 1000 },
});

export const GET = handler;
