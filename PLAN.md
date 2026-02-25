# linkpeek Implementation Plan

## Phase 8: Link Preview UI Refresh (YC-style card)
- [x] Capture target layout (vertical image-first card with YC-style typography)
- [x] Update popover DOM structure to match new layout
- [x] Refresh CSS variables, typography, and spacing to mirror design
- [x] Verify in demo pages and run tests

## Phase 9: Dev Build Wiring
- [x] Identify why UI changes are not reflected in demo
- [x] Update dev script to run package watchers alongside the demo
- [x] Verify builds and demo behavior

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
- Updated link preview popover to a YC-style, image-first vertical card with refreshed typography and gradients.
- Tests: `pnpm test`
- Ensured dev workflow rebuilds workspace packages before the demo runs to reflect UI changes.
- Builds: `pnpm -r --filter linkpeek --filter linkpeek-react --filter linkpeek-server build`
