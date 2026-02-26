# linkpeek

Notion-like rich link previews on hover/focus for any web page.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Try%20Now-black)](https://linkpeek-demo.vercel.app/demo)

## What it does

When a user hovers or focuses a link, linkpeek shows a rich preview popover with the page's title, description, image, and favicon. Works with any HTML container, any framework, and supports both client-only and server-resolved previews.

## Demo

- Live demo: https://linkpeek-demo.vercel.app/demo
- Client-side demo route: `https://linkpeek-demo.vercel.app/demo/client-demo`
- Server-resolved demo route: `https://linkpeek-demo.vercel.app/demo/server-demo`

Notes:
- The `/server-demo` page calls `/demo/api/preview`, so external fetch behavior depends on network access and target-site availability.

## Packages

| Package | Description |
|---------|-------------|
| [`linkpeek`](packages/linkpeek) | Core client library (framework-agnostic) |
| [`linkpeek-react`](packages/linkpeek-react) | React provider + hook wrapper |
| [`linkpeek-server`](packages/linkpeek-server) | Server-side URL resolver |

## Quickstart: Vanilla JS

```js
import { attachLinkPreviews, injectStyles } from 'linkpeek';

injectStyles();

const cleanup = attachLinkPreviews(document.body, {
  resolve: async (url) => {
    const res = await fetch(`/api/preview?url=${encodeURIComponent(url)}`);
    return res.json();
  },
});

// Later: cleanup() to remove all listeners
```

## Quickstart: React

```tsx
import { LinkPreviewProvider, LinkPreviewRoot } from 'linkpeek-react';

const resolve = async (url: string) => {
  const res = await fetch(`/api/preview?url=${encodeURIComponent(url)}`);
  return res.json();
};

function App() {
  return (
    <LinkPreviewProvider resolve={resolve}>
      <LinkPreviewRoot>
        <article>
          <a href="https://github.com">GitHub</a>
        </article>
      </LinkPreviewRoot>
    </LinkPreviewProvider>
  );
}
```

## Quickstart: Next.js API Route

```ts
// app/api/preview/route.ts
import { createNextRouteHandler } from 'linkpeek-server';

const handler = createNextRouteHandler();
export const GET = handler;
export const OPTIONS = handler.OPTIONS;
```

## Express Middleware

```ts
import express from 'express';
import { createExpressMiddleware } from 'linkpeek-server';

const app = express();
app.get('/api/preview', createExpressMiddleware());
app.listen(3000);
```

## Cloudflare Worker

```ts
import { resolveUrlPreview } from 'linkpeek-server';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const target = url.searchParams.get('url');
    if (!target) {
      return new Response('Missing url param', { status: 400 });
    }
    const preview = await resolveUrlPreview(target);
    return new Response(JSON.stringify(preview), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
```

> **Note:** SSRF DNS-based protection uses `dns.promises.lookup` which is Node.js-specific. On Cloudflare Workers, you may need to disable DNS-based SSRF checks and rely on domain allowlists instead.

## Security: SSRF Protection

The server package includes built-in SSRF (Server-Side Request Forgery) protection:

- Only allows `http://` and `https://` protocols
- Blocks URLs with embedded credentials
- Resolves DNS and blocks private/internal IP ranges (127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16, IPv6 loopback/private)
- Re-validates each redirect destination against SSRF rules
- Configurable domain allowlists and blocklists

## Response Contract

`resolveUrlPreview` and server adapters return a `LinkPreview` JSON object.

Success shape:

```json
{
  "url": "https://example.com",
  "canonicalUrl": "https://example.com/page",
  "title": "Example Title",
  "description": "Example description",
  "siteName": "Example",
  "image": { "url": "https://example.com/hero.png", "width": 1200, "height": 630 },
  "favicon": "https://example.com/favicon.ico",
  "fetchedAt": "2026-02-25T23:00:00.000Z"
}
```

Failure shape:

```json
{
  "url": "https://example.com",
  "fetchedAt": "2026-02-25T23:00:00.000Z",
  "error": {
    "code": "TIMEOUT",
    "message": "Request timed out after 10000ms"
  }
}
```

Common error codes include: `TIMEOUT`, `DOMAIN_BLOCKED`, `NOT_HTML`, `HTTP_ERROR`, `TOO_MANY_REDIRECTS`, `SSRF_BLOCKED`, `INVALID_URL`.

## Production Hardening Example

```ts
import { createNextRouteHandler } from 'linkpeek-server';

const handler = createNextRouteHandler({
  timeoutMs: 8000,
  maxBytes: 1_048_576,
  maxRedirects: 5,
  allowlistDomains: ['github.com', 'news.ycombinator.com', 'developer.mozilla.org'],
  cache: { enabled: true, ttlMs: 24 * 60 * 60 * 1000, max: 1000 },
});

export const GET = handler;
export const OPTIONS = handler.OPTIONS;
```

## FAQ

### Why do I need a server?

Browsers enforce CORS (Cross-Origin Resource Sharing), which prevents client-side JavaScript from fetching HTML from arbitrary external domains. The server package acts as a proxy that fetches the page, extracts metadata, and returns it as JSON.

For internal links on the same origin, you can resolve metadata client-side without a server.

### Can I use a custom resolver?

Yes. The `resolve` option accepts any async function `(url: string) => Promise<LinkPreview | null>`. You can use a static map, a database, a CMS API, or anything else.

## License

[MIT](LICENSE)
