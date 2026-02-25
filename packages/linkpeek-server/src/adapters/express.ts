import { resolveUrlPreview } from '../resolver';
import type { MiddlewareOptions } from '../types';

/**
 * Creates an Express-compatible middleware for link preview resolution.
 *
 * Uses `any` for req/res to avoid requiring @types/express as a dependency.
 * For full type safety, users can cast or install @types/express.
 *
 * Usage:
 * ```ts
 * import express from 'express';
 * import { createExpressMiddleware } from 'linkpeek-server';
 *
 * const app = express();
 * app.get('/api/link-preview', createExpressMiddleware({ paramName: 'url' }));
 * ```
 */
export function createExpressMiddleware(opts?: MiddlewareOptions) {
  const paramName = opts?.paramName ?? 'url';

  return async function linkpeekMiddleware(
    req: any,
    res: any,
    _next: any,
  ): Promise<void> {
    // ── Extract URL from query string ──────────────────────────────
    const targetUrl: string | undefined = req.query?.[paramName];

    if (!targetUrl) {
      res.status(400).json({
        error: {
          code: 'MISSING_URL',
          message: `Missing "${paramName}" query parameter`,
        },
      });
      return;
    }

    try {
      // ── Resolve preview ──────────────────────────────────────────
      const preview = await resolveUrlPreview(targetUrl, opts);

      // Set CORS headers
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type');

      if (!preview.error) {
        res.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
      }

      const status = preview.error ? 502 : 200;
      res.status(status).json(preview);
    } catch (err) {
      // This should not happen since resolveUrlPreview catches all errors,
      // but handle it defensively.
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    }
  };
}
