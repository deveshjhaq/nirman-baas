# Contributing to Nirman

Thanks for your interest in contributing to Nirman.

This guide helps you contribute quickly and consistently across the monorepo.

## Ways to Contribute

- Report bugs
- Suggest features
- Improve docs
- Fix issues
- Add tests
- Improve developer experience

## Hacktoberfest

Nirman welcomes Hacktoberfest contributors.

To make your PR count and get merged faster:

- Pick issues labeled good first issue, hacktoberfest, or help wanted.
- Open an issue before starting if no suitable issue exists.
- Keep each PR focused on one clear change.
- Do not submit spam, auto-generated, or low-quality PRs.
- Add tests or docs updates when behavior changes.
- Ensure lint, test, and build checks pass.

Maintainers may close PRs that are off-topic, very low quality, or duplicate existing work.

## Project Stack

- Gateway: Go + Chi
- Hub: Bun + Hono (TypeScript)
- Workers: Python + Celery
- Realtime: Go + WebSockets
- Dashboard: Next.js + TypeScript
- Infra: Docker Compose, PostgreSQL, Redis, Nginx

## Prerequisites

- Docker + Docker Compose
- Node.js 20+
- Bun
- Go 1.21+
- Python 3.11+

## Local Setup

```bash
git clone https://github.com/deveshjhaq/nirman-baas.git
cd nirman-baas
npm install
docker compose up --build
```

## Development Workflow

1. Fork the repository.
2. Create a branch from `main`.
3. Make focused changes.
4. Add or update tests when applicable.
5. Run checks locally.
6. Open a pull request.

Branch naming examples:

- `feat/gateway-api-key-scope`
- `fix/realtime-auth-check`
- `docs/readme-improvements`

## Recommended Local Checks

From repository root:

```bash
npm run lint
npm run test
npm run build
```

If your change affects only one service, run that service-specific checks as well.

## Commit Message Guidelines

Use clear, action-based commit messages.

Examples:

- `feat(gateway): add api key scope validation`
- `fix(hub): validate project header in internal middleware`
- `docs: update local setup instructions`

## Pull Request Guidelines

Please include:

- What changed
- Why it changed
- How it was tested
- Any breaking changes
- Screenshots (for dashboard UI changes)

Keep pull requests small and focused where possible.

## Coding Guidelines

- Follow existing folder structure and naming.
- Avoid unrelated refactoring in the same PR.
- Keep public APIs backward compatible unless the PR is explicitly breaking.
- Prefer small, composable functions.
- Add comments only where logic is non-obvious.

## Documentation Guidelines

- Update README or docs when behavior changes.
- Keep examples runnable and realistic.
- Use consistent terms: Gateway, Hub, Workers, Realtime, Dashboard.

## Reporting Bugs

When opening a bug report, include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Logs/error messages
- Environment (OS, Docker version, Node/Bun/Go/Python versions)

## Feature Requests

For feature requests, include:

- Problem statement
- Proposed solution
- Alternatives considered
- Potential impact on existing services

## Security

Do not open public issues for sensitive vulnerabilities.

For responsible disclosure, contact project maintainers privately first.

## Code of Conduct

Be respectful and constructive in discussions and reviews.

## Need Help?

Open a discussion or issue with clear context and reproduction details.

Thanks for helping make Nirman better.
