# AGENTS.md

## Workflow
- For any non-trivial task, write a plan to PLAN.md before making changes
- Plans must use checkable items
- Re-plan immediately if assumptions break

## Execution Rules
- Prefer root-cause fixes over surface patches
- Minimize code impact
- Avoid force flags and hacks unless absolutely necessary

## Scope Control
- Touch only what’s necessary
- No refactors unless required for the fix
- Optional improvements must be listed as optional in PLAN.md

## Dependency and Tooling Rules
- Do not use --force or --legacy-peer-deps unless explicitly requested
- When changing dependencies, explain why and show the exact changes to package.json and lockfile

## Verification
- Never consider work complete without verification
- Run tests, validate behavior, check for regressions
- Diff behavior when relevant

## Debugging Discipline
- When debugging, record: repro steps, root cause, fix, verification
- Prefer smallest correct fix, not a workaround

## Quality Bar
- Choose the simplest correct solution
- If a fix feels brittle, rethink it
- Apply senior-level engineering judgment

## Task Tracking
- Update PLAN.md as work progresses
- Add a short review section after completion
- Capture recurring mistakes in tasks/lessons.md
