# linkpeek-server

Server-side URL preview resolver for [linkpeek](../linkpeek). Fetches HTML pages and extracts Open Graph, Twitter Card, and standard meta tag metadata.

## Installation

```bash
npm install linkpeek-server
```

## Usage

### Direct resolver

```ts
import { resolveUrlPreview } from 'linkpeek-server';

const preview = await resolveUrlPreview('https://github.com');
console.log(preview.title); // "GitHub"
```

### Next.js App Router

```ts
// app/api/preview/route.ts
import { createNextRouteHandler } from 'linkpeek-server';

const handler = createNextRouteHandler({
  timeoutMs: 5000,
  cache: { enabled: true, ttlMs: 86400000, max: 1000 },
});
export const GET = handler;
export const OPTIONS = handler.OPTIONS;
```

### Express

```ts
import express from 'express';
import { createExpressMiddleware } from 'linkpeek-server';

const app = express();
app.get('/api/preview', createExpressMiddleware());
app.listen(3000);
```

### Cloudflare Worker

```ts
import { resolveUrlPreview } from 'linkpeek-server';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url).searchParams.get('url');
    if (!url) return new Response('Missing url', { status: 400 });
    // Note: disable ssrfProtection if dns.promises is unavailable
    const preview = await resolveUrlPreview(url, {
      ssrfProtection: { enabled: false },
    });
    return Response.json(preview);
  },
};
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `userAgent` | `string` | reasonable default | HTTP User-Agent header |
| `timeoutMs` | `number` | `10000` | Request timeout in ms |
| `maxBytes` | `number` | `1048576` (1 MB) | Max response body size |
| `maxRedirects` | `number` | `5` | Max redirect hops |
| `allowlistDomains` | `string[]` | - | Only allow these domains |
| `blocklistDomains` | `string[]` | - | Block these domains |
| `cache` | `object` | disabled unless provided | LRU cache config (`enabled`, `ttlMs`, `max`) |
| `ssrfProtection` | `object` | `{ enabled: true }` | SSRF protection toggle |

## Response Contract

The resolver returns `LinkPreview` JSON with either metadata fields or an `error` object.

- Success: `url` plus optional `canonicalUrl`, `title`, `description`, `siteName`, `image`, `favicon`, and `fetchedAt`
- Failure: `url`, `fetchedAt`, and `error: { code, message }`

Common `error.code` values: `TIMEOUT`, `DOMAIN_BLOCKED`, `NOT_HTML`, `HTTP_ERROR`, `TOO_MANY_REDIRECTS`, `SSRF_BLOCKED`, `INVALID_URL`.

## Security: SSRF Protection

Enabled by default. Protects against Server-Side Request Forgery by:

- Allowing only `http://` and `https://` protocols
- Blocking URLs with embedded credentials (`user:pass@host`)
- Resolving DNS and blocking private/internal IPs
- Re-validating each redirect against SSRF rules

Private IP ranges blocked: `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `0.0.0.0`, IPv6 `::1`, `fc00::/7`, `fe80::/10`.
