import { LRUCache } from './cache';
import { FetchError, fetchUrl } from './fetcher';
import { parseHtml } from './parser';
import type { LinkPreview, ResolveOptions } from './types';

/** Default resolver options */
const DEFAULTS: Required<
  Pick<ResolveOptions, 'timeoutMs' | 'maxBytes' | 'maxRedirects' | 'ssrfProtection'>
> = {
  timeoutMs: 10_000,
  maxBytes: 1_048_576,
  maxRedirects: 5,
  ssrfProtection: { enabled: true },
};

/**
 * Module-level cache instance, lazily initialized on first use with caching
 * enabled. Shared across all calls to resolveUrlPreview unless the caller
 * supplies different cache options.
 */
let sharedCache: LRUCache | null = null;

function getCache(opts: ResolveOptions): LRUCache | null {
  const cacheOpts = opts.cache;
  if (!cacheOpts || !cacheOpts.enabled) return null;

  if (!sharedCache) {
    sharedCache = new LRUCache({ max: cacheOpts.max, ttlMs: cacheOpts.ttlMs });
  }
  return sharedCache;
}

/**
 * Resolves a URL to a link preview by fetching the page and extracting
 * Open Graph / meta tag data.
 *
 * On success, returns a LinkPreview with metadata fields populated.
 * On failure, returns a LinkPreview with the `error` field set. Errors
 * are never thrown -- they are always captured into the result object.
 */
export async function resolveUrlPreview(
  url: string,
  opts?: ResolveOptions,
): Promise<LinkPreview> {
  const options: ResolveOptions = { ...DEFAULTS, ...opts };
  const cache = getCache(options);

  // ── Check cache ────────────────────────────────────────────────────
  if (cache) {
    const cached = cache.get(url);
    if (cached) return cached;
  }

  try {
    // ── Fetch ──────────────────────────────────────────────────────
    const { html, finalUrl } = await fetchUrl(url, options);

    // ── Parse ──────────────────────────────────────────────────────
    const preview: LinkPreview = {
      ...parseHtml(html, finalUrl),
      url,
      fetchedAt: new Date().toISOString(),
    };

    // If the final URL differs from the input, keep the original as `url`
    // and let canonicalUrl reflect the resolved destination.
    if (finalUrl !== url && !preview.canonicalUrl) {
      preview.canonicalUrl = finalUrl;
    }

    // ── Cache success ──────────────────────────────────────────────
    if (cache) {
      cache.set(url, preview, false);
    }

    return preview;
  } catch (err) {
    const code = err instanceof FetchError ? err.code : 'UNKNOWN_ERROR';
    const message = err instanceof Error ? err.message : 'An unknown error occurred';

    const failurePreview: LinkPreview = {
      url,
      fetchedAt: new Date().toISOString(),
      error: { code, message },
    };

    // ── Cache failure (short TTL) ──────────────────────────────────
    if (cache) {
      cache.set(url, failurePreview, true);
    }

    return failurePreview;
  }
}
