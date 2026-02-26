# Lessons

- Keep transport behavior and advertised API behavior aligned: if CORS headers declare `OPTIONS`, route handlers must actually implement/export `OPTIONS`.
- Treat network security checks as multi-answer by default: DNS validations should evaluate all resolved records, not only the first answer.
- Avoid hidden global coupling in caches: module-level cache reuse must be keyed by effective configuration to prevent cross-request behavior drift.
- Prevent README drift by deriving documented defaults/examples from source constants before release.
- Put a live demo link near the top of README to reduce contributor onboarding friction.
- For Vercel monorepos with `workspace:*` deps, deploy from repo root and explicitly map the app (for example via `@vercel/next` build config) to avoid `npm install` workspace failures.
- When an app is deployed under a nested monorepo path, add explicit rewrites so public paths like `/` and `/demo` stay stable for users.
- If Next pages are served via rewrites from a subpath app, also rewrite `/_next/*` to the app subpath or hydration scripts will 404 and client behavior will silently break.
