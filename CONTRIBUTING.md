# Contributing to linkpeek

Thanks for your interest in contributing to linkpeek! This guide will help you get started.

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [pnpm](https://pnpm.io/) v8 or later

### Getting Started

1. Fork and clone the repository:

   ```bash
   git clone https://github.com/<your-username>/linkpeek.git
   cd linkpeek
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build all packages:

   ```bash
   pnpm build
   ```

4. Start the dev server (watches for changes):

   ```bash
   pnpm dev
   ```

## Running Tests

Run the full test suite:

```bash
pnpm test
```

Run tests for a specific package:

```bash
pnpm --filter linkpeek test
pnpm --filter linkpeek-react test
pnpm --filter linkpeek-server test
```

## Pull Request Process

1. Create a feature branch from `main`:

   ```bash
   git checkout -b feat/my-feature
   ```

2. Make your changes and ensure all tests pass.

3. Add a changeset describing your change:

   ```bash
   pnpm changeset
   ```

   Follow the prompts to select the affected packages and describe the change. This is **required** for any PR that modifies package behavior.

4. Commit your changes and push your branch.

5. Open a pull request against `main`. Fill out the PR template and link any related issues.

6. Wait for CI to pass and a maintainer to review your PR.

## Code Style

This project uses **Prettier** for formatting and **ESLint** for linting. Both run automatically on pre-commit hooks, but you can also run them manually:

```bash
pnpm lint
pnpm format
```

Please do not disable or override existing rules without discussion.

## Changeset Requirement

Every PR that changes published package code must include a changeset. Changesets drive our versioning and changelog generation. If your PR is documentation-only or affects only internal tooling, you can skip this step.

To add a changeset:

```bash
pnpm changeset
```

Choose the appropriate bump type:

- **patch** -- bug fixes, minor internal changes
- **minor** -- new features, non-breaking additions
- **major** -- breaking changes

## Reporting Issues

If you find a bug or have a feature request, please [open an issue](https://github.com/linkpeek/linkpeek/issues/new). Include as much context as possible: steps to reproduce, expected behavior, and your environment.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
