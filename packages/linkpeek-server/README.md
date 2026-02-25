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

export const GET = createNextRouteHandler({
  timeoutMs: 5000,
  cache: { enabled: true, ttlMs: 86400000, max: 1000 },
});
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
| `timeoutMs` | `number` | `5000` | Request timeout in ms |
| `maxBytes` | `number` | `1000000` | Max response body size |
| `maxRedirects` | `number` | `3` | Max redirect hops |
| `allowlistDomains` | `string[]` | - | Only allow these domains |
| `blocklistDomains` | `string[]` | - | Block these domains |
| `cache` | `object` | enabled, 24h, 10000 | LRU cache config |
| `ssrfProtection` | `object` | `{ enabled: true }` | SSRF protection toggle |

## Security: SSRF Protection

Enabled by default. Protects against Server-Side Request Forgery by:

- Allowing only `http://` and `https://` protocols
- Blocking URLs with embedded credentials (`user:pass@host`)
- Resolving DNS and blocking private/internal IPs
- Re-validating each redirect against SSRF rules

Private IP ranges blocked: `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `0.0.0.0`, IPv6 `::1`, `fc00::/7`, `fe80::/10`.
