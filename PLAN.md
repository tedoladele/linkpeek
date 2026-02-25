# linkpeek Implementation Plan

## Phase 1: Monorepo Scaffolding
- [x] Root package.json, pnpm-workspace.yaml, tsconfig.json
- [x] ESLint, Prettier, Changesets configs
- [x] LICENSE, CONTRIBUTING.md, CODE_OF_CONDUCT.md

## Phase 2: Shared Types & Core Client Library (packages/linkpeek)
- [x] types.ts with LinkPreview, ResolveFn
- [x] LRU cache with TTL
- [x] CSS styles matching screenshot (Notion-like card)
- [x] Popover positioning with @floating-ui/dom
- [x] Event delegation (pointerenter/leave, focusin/out)
- [x] Hover intent with openDelay/closeDelay
- [x] Interactive popover (hover into popover keeps it open)
- [x] URL filtering (mailto, tel, #, download, data-linkpeek="off")
- [x] Accessibility (role, aria, Escape key)
- [x] Prefers-reduced-motion support
- [x] Theme support (light/dark/system)
- [x] attachLinkPreviews / cleanup API
- [x] Package build config (tsup, ESM+CJS)

## Phase 3: Server Resolver (packages/linkpeek-server)
- [x] SSRF protection (DNS resolution, private IP blocking)
- [x] HTML fetching with timeout, maxBytes, redirect handling
- [x] HTML parsing (OG, Twitter, standard meta, favicon)
- [x] URL normalization (relative to absolute)
- [x] Server-side LRU cache
- [x] createNextRouteHandler adapter
- [x] createExpressMiddleware adapter
- [x] Package build config (tsup, ESM)

## Phase 4: React Wrapper (packages/linkpeek-react)
- [x] LinkPreviewProvider context
- [x] useLinkPreview hook
- [x] LinkPreviewRoot component
- [x] Package build config (tsup, ESM+CJS)

## Phase 5: Demo App (apps/demo)
- [x] Next.js app router setup
- [x] /api/preview route using linkpeek-server
- [x] Client-only demo page with fake resolver
- [x] Server-mode demo page
- [x] Theme toggle, delay sliders, interactive toggle
- [x] Article-like content with multiple links

## Phase 6: Tests
- [x] Vitest config
- [x] URL filtering tests
- [x] Cache TTL tests
- [x] HTML parsing tests with fixtures
- [x] SSRF blocking matrix tests
- [ ] Playwright test for hover popover (config only, needs browser)

## Phase 7: Documentation
- [x] Root README.md
- [x] Per-package READMEs

## Review
- TBD after implementation
