# Lessons

- Keep transport behavior and advertised API behavior aligned: if CORS headers declare `OPTIONS`, route handlers must actually implement/export `OPTIONS`.
- Treat network security checks as multi-answer by default: DNS validations should evaluate all resolved records, not only the first answer.
- Avoid hidden global coupling in caches: module-level cache reuse must be keyed by effective configuration to prevent cross-request behavior drift.
