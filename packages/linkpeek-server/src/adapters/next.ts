import { resolveUrlPreview } from '../resolver';
import type { MiddlewareOptions } from '../types';

/**
 * Creates a Next.js App Router route handler for link preview resolution.
 *
 * Usage in `app/api/link-preview/route.ts`:
 * ```ts
 * import { createNextRouteHandler } from 'linkpeek-server';
 * export const GET = createNextRouteHandler({ paramName: 'url' });
 * ```
 */
export function createNextRouteHandler(opts?: MiddlewareOptions) {
  const paramName = opts?.paramName ?? 'url';

  return async function GET(request: Request): Promise<Response> {
    // ── Extract URL from query string ──────────────────────────────
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get(paramName);

    if (!targetUrl) {
      return new Response(
        JSON.stringify({
          error: { code: 'MISSING_URL', message: `Missing "${paramName}" query parameter` },
        }),
        {
          status: 400,
          headers: jsonHeaders(),
        },
      );
    }

    // ── Resolve preview ────────────────────────────────────────────
    const preview = await resolveUrlPreview(targetUrl, opts);

    // Determine HTTP status: 200 for success, 502 for upstream errors
    const status = preview.error ? 502 : 200;

    return new Response(JSON.stringify(preview), {
      status,
      headers: jsonHeaders(preview.error ? undefined : 'public, max-age=3600, s-maxage=86400'),
    });
  };
}

/**
 * Builds standard response headers for JSON API responses.
 * Includes permissive CORS headers so the endpoint can be called from any origin.
 */
function jsonHeaders(cacheControl?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (cacheControl) {
    headers['Cache-Control'] = cacheControl;
  }

  return headers;
}
