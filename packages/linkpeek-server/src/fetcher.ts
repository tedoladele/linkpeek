import { validateUrl, validateResolvedIp } from './ssrf';
import type { ResolveOptions } from './types';

const DEFAULT_USER_AGENT = 'linkpeek-server/0.1 (+https://github.com/linkpeek)';
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_BYTES = 1_048_576; // 1 MB
const DEFAULT_MAX_REDIRECTS = 5;

/**
 * Fetches a URL and returns the HTML body along with the final (post-redirect)
 * URL. Enforces timeout, max body size, content-type, domain lists, and SSRF
 * protections.
 */
export async function fetchUrl(
  url: string,
  options: ResolveOptions,
): Promise<{ html: string; finalUrl: string }> {
  const userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
  const ssrfEnabled = options.ssrfProtection?.enabled !== false; // default: on

  let currentUrl = url;
  let redirectCount = 0;

  // Follow redirects manually so we can validate each intermediate URL
  while (true) {
    // ── Validate the URL before fetching ────────────────────────────
    validateUrlOrThrow(currentUrl, options, ssrfEnabled);

    // ── SSRF: validate resolved IP ──────────────────────────────────
    if (ssrfEnabled) {
      const parsed = new URL(currentUrl);
      const ipCheck = await validateResolvedIp(parsed.hostname);
      if (!ipCheck.valid) {
        throw new FetchError('SSRF_BLOCKED', ipCheck.reason ?? 'SSRF check failed');
      }
    }

    // ── Fetch with timeout ──────────────────────────────────────────
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(currentUrl, {
        method: 'GET',
        headers: {
          'User-Agent': userAgent,
          Accept: 'text/html, application/xhtml+xml',
        },
        signal: controller.signal,
        redirect: 'manual', // handle redirects ourselves
      });
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new FetchError('TIMEOUT', `Request timed out after ${timeoutMs}ms`);
      }
      throw new FetchError(
        'FETCH_FAILED',
        err instanceof Error ? err.message : 'Network request failed',
      );
    } finally {
      clearTimeout(timer);
    }

    // ── Handle redirects ────────────────────────────────────────────
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) {
        throw new FetchError('REDIRECT_ERROR', `Redirect (${response.status}) with no Location header`);
      }

      redirectCount++;
      if (redirectCount > maxRedirects) {
        throw new FetchError('TOO_MANY_REDIRECTS', `Exceeded maximum of ${maxRedirects} redirects`);
      }

      // Resolve relative redirect URLs against the current URL
      try {
        currentUrl = new URL(location, currentUrl).href;
      } catch {
        throw new FetchError('REDIRECT_ERROR', `Invalid redirect URL: ${location}`);
      }

      // Loop back to validate and fetch the redirect target
      continue;
    }

    // ── Check HTTP status ───────────────────────────────────────────
    if (!response.ok) {
      throw new FetchError(
        'HTTP_ERROR',
        `HTTP ${response.status} ${response.statusText}`,
      );
    }

    // ── Validate content-type ───────────────────────────────────────
    const contentType = response.headers.get('content-type') ?? '';
    if (
      !contentType.includes('text/html') &&
      !contentType.includes('application/xhtml+xml')
    ) {
      throw new FetchError(
        'NOT_HTML',
        `Expected HTML content-type but got: ${contentType || '(empty)'}`,
      );
    }

    // ── Read body with size limit ───────────────────────────────────
    const html = await readBodyWithLimit(response, maxBytes);

    return { html, finalUrl: currentUrl };
  }
}

/**
 * Validates a URL against basic checks, domain allowlist/blocklist, and SSRF
 * URL-level rules. Throws FetchError on failure.
 */
function validateUrlOrThrow(
  url: string,
  options: ResolveOptions,
  ssrfEnabled: boolean,
): void {
  // Basic URL validation (protocol, credentials, etc.)
  if (ssrfEnabled) {
    const urlCheck = validateUrl(url);
    if (!urlCheck.valid) {
      throw new FetchError('INVALID_URL', urlCheck.reason ?? 'Invalid URL');
    }
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new FetchError('INVALID_URL', 'Could not parse URL');
  }

  const hostname = parsed.hostname.toLowerCase();

  // ── Domain allowlist (if set, ONLY these domains are permitted) ───
  if (options.allowlistDomains && options.allowlistDomains.length > 0) {
    const allowed = options.allowlistDomains.some(
      (d) => hostname === d.toLowerCase() || hostname.endsWith('.' + d.toLowerCase()),
    );
    if (!allowed) {
      throw new FetchError('DOMAIN_BLOCKED', `Domain "${hostname}" is not in the allowlist`);
    }
  }

  // ── Domain blocklist ──────────────────────────────────────────────
  if (options.blocklistDomains && options.blocklistDomains.length > 0) {
    const blocked = options.blocklistDomains.some(
      (d) => hostname === d.toLowerCase() || hostname.endsWith('.' + d.toLowerCase()),
    );
    if (blocked) {
      throw new FetchError('DOMAIN_BLOCKED', `Domain "${hostname}" is blocked`);
    }
  }
}

/**
 * Reads the response body incrementally, enforcing a byte limit to prevent
 * memory exhaustion from extremely large responses.
 */
async function readBodyWithLimit(
  response: Response,
  maxBytes: number,
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new FetchError('FETCH_FAILED', 'Response has no readable body');
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        reader.cancel();
        throw new FetchError(
          'BODY_TOO_LARGE',
          `Response body exceeds maximum of ${maxBytes} bytes`,
        );
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const decoder = new TextDecoder('utf-8', { fatal: false });
  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return decoder.decode(combined);
}

/**
 * Custom error class for fetch failures with a machine-readable code.
 */
export class FetchError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'FetchError';
  }
}
