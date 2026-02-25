/** Metadata for a link preview */
export interface LinkPreview {
  /** The original URL */
  url: string;
  /** Canonical URL if different from original */
  canonicalUrl?: string;
  /** Page title */
  title?: string;
  /** Page description */
  description?: string;
  /** Site name (e.g., "GitHub", "YouTube") */
  siteName?: string;
  /** Preview image */
  image?: {
    url: string;
    width?: number;
    height?: number;
  };
  /** Favicon URL */
  favicon?: string;
  /** ISO date when metadata was fetched */
  fetchedAt?: string;
  /** Error info when resolver fails */
  error?: {
    code: string;
    message: string;
  };
}

/** Options for the server-side URL resolver */
export interface ResolveOptions {
  /** Custom User-Agent string for fetch requests */
  userAgent?: string;
  /** Request timeout in milliseconds. Default: 10000 */
  timeoutMs?: number;
  /** Maximum response body size in bytes. Default: 1MB */
  maxBytes?: number;
  /** Maximum number of redirects to follow. Default: 5 */
  maxRedirects?: number;
  /** Only allow fetching from these domains (takes precedence over blocklist) */
  allowlistDomains?: string[];
  /** Block fetching from these domains */
  blocklistDomains?: string[];
  /** Cache configuration */
  cache?: { enabled: boolean; ttlMs: number; max: number };
  /** SSRF protection configuration. Default: enabled */
  ssrfProtection?: { enabled: boolean };
}

/** Options for framework middleware/route handlers */
export interface MiddlewareOptions extends ResolveOptions {
  /** Query parameter name for URL. Default: "url" */
  paramName?: string;
}

/** Cache stats for debugging */
export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
}
