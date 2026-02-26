# linkpeek Implementation Plan

## Phase 11: Review Findings Remediation
- [x] Reproduce and fix SSRF DNS validation to reject any private DNS answer
- [x] Make resolver cache respect per-call cache configuration
- [x] Add Next.js OPTIONS handler support for declared CORS methods
- [x] Ensure custom-render popovers always have stable IDs for aria-describedby
- [x] Add/update targeted tests for the above fixes
- [x] Run full test suite and confirm no regressions

## Phase 12: README Accuracy and Integration Guidance
- [x] Align README defaults/examples with current implementation values
- [x] Document Next.js GET + OPTIONS export pattern
- [x] Add response contract section for success/error payloads
- [x] Add production hardening snippet for server resolver settings
- [x] Review docs for consistency and regressions

## Phase 13: Hosted Demo Link in README
- [x] Add a prominent live demo link near the top of the root README
- [x] Add a short Demo section with routes and behavior notes for contributors
- [x] Review README flow and wording after insertion

## Phase 14: Deploy Demo and Wire Real URL
- [x] Confirm Vercel auth/project linkage for `apps/demo`
- [x] Deploy production build of the demo app
- [x] Replace README placeholder demo URLs with deployed production URL
- [x] Verify README links and summarize deployment output

## Phase 15: Fix Root 404 on Hosted Demo
- [x] Add root-level route rewrites so `/` and top-level demo paths resolve
- [x] Redeploy and verify root URL returns 200
- [x] Update README demo links to clean root paths
- [x] Summarize fix and verification output

## Phase 16: Restore Demo Hydration and Hover Previews
- [x] Add rewrite for Next static assets (`/_next/*`) to app subpath
- [x] Redeploy production and verify static chunks return 200
- [x] Verify hover previews render on `/demo/client-demo` and `/demo/server-demo`
- [x] Update plan review with root cause and verification evidence

## Phase 8: Link Preview UI Refresh (YC-style card)
- [x] Capture target layout (vertical image-first card with YC-style typography)
- [x] Update popover DOM structure to match new layout
- [x] Refresh CSS variables, typography, and spacing to mirror design
- [x] Verify in demo pages and run tests

## Phase 9: Dev Build Wiring
- [x] Identify why UI changes are not reflected in demo
- [x] Update dev script to run package watchers alongside the demo
- [x] Verify builds and demo behavior

## Phase 10: Hover Close Regression
- [x] Reproduce and identify why hover exit no longer closes popover
- [x] Implement minimal fix to restore expected close behavior
- [x] Verify behavior and run tests

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
- Resolved demo hydration failure by rewriting `/_next/*` to `/apps/demo/_next/*` in `vercel.json`.
- Redeployed and verified JS chunks now return `200` instead of `404`, which restores client hydration.
- Verified `/demo/client-demo` and `/demo/server-demo` return `200`, and `/demo/api/preview` returns live metadata JSON.
- Fixed hosted routing by adding rewrites for `/`, `/demo`, `/demo/*`, and top-level demo/API paths.
- Redeployed and verified `https://linkpeek-demo.vercel.app/` and `https://linkpeek-demo.vercel.app/demo` both return `200`.
- Updated README demo links to use the clean `/demo` paths.
- Deployed the demo to Vercel and verified a Ready production URL: `https://linkpeek-demo.vercel.app`.
- Added root `vercel.json` using `@vercel/next` for `apps/demo` so monorepo workspace dependencies build correctly.
- Updated README live-demo links to the working hosted routes under `/apps/demo`.
- Added a prominent "Live Demo" badge and a new Demo section in the root README.
- Included contributor-focused route links for `/client-demo` and `/server-demo` with behavior notes.
- Used a placeholder host (`https://your-demo-domain.example`) for straightforward replacement after deployment.
- Synced root and package README defaults with actual runtime values (`timeoutMs`, `maxBytes`, `maxRedirects`, cache defaults).
- Updated Next.js route examples to export both `GET` and `OPTIONS` from `createNextRouteHandler`.
- Added response contract documentation (success/error shapes + common error codes) in root and server READMEs.
- Added a production hardening snippet with allowlist, limits, redirects, and cache settings.
- Fixed SSRF DNS validation to inspect all resolved answers and block if any are private/reserved.
- Isolated resolver cache instances by cache config (`max` + `ttlMs`) to avoid cross-call config leakage.
- Added Next.js route OPTIONS support and wired demo API route export for CORS preflight.
- Ensured custom-render popovers receive stable IDs before `aria-describedby` is set.
- Added regression tests for SSRF multi-answer DNS handling, resolver cache isolation, and Next OPTIONS behavior.
- Tests: `pnpm -s test` (69 tests passing)
- Updated link preview popover to a YC-style, image-first vertical card with refreshed typography and gradients.
- Tests: `pnpm test`
- Ensured dev workflow rebuilds workspace packages before the demo runs to reflect UI changes.
- Builds: `pnpm -r --filter linkpeek --filter linkpeek-react --filter linkpeek-server build`
- Restored hover-close behavior by delegating `pointerout` and guarding against internal anchor moves.
- Tests: `pnpm test`
