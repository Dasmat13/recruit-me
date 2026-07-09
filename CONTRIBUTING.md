# Contributing to Recruit Me

Thanks for your interest in **Recruit Me**! This repo is open to many kinds of contributions:
frontend, backend, challenges, themes, docs, and accessibility.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How to Contribute](#how-to-contribute)
3. [Bug Reports](#bug-reports)
4. [Feature Requests](#feature-requests)
5. [Pull Requests](#pull-requests)
6. [Development Setup](#development-setup)
7. [Writing a Challenge](#writing-a-challenge)
8. [Style Guide](#style-guide)

## Code of Conduct

By participating, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

- Check [open issues](https://github.com/Dasmat13/recruit-me/issues) for tasks labeled `good first issue` or `help wanted`.
- If you plan a larger change, **open an issue first** to discuss scope.

## Bug Reports

Use the [Bug Report](https://github.com/Dasmat13/recruit-me/issues/new?template=bug_report.md) issue template.

## Feature Requests

Use the [Feature Request](https://github.com/Dasmat13/recruit-me/issues/new?template=feature_request.md) issue template.

## Pull Requests

1. Fork the repo and create your branch from `main`.
2. Make your changes.
3. Open a PR and reference the issue (e.g. `Closes #4`).

## Development Setup

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- npm

### Frontend Demo
```bash
cd apps/demo-portfolio
python3 -m http.server 8000
```

### Backend
```bash
cd server
npm install
npm run dev
```

### Docker
```bash
docker-compose up --build
```

## Writing a Challenge

Challenges live in `challenges/*/index.js`. Each module exports an `init(container)` function.
Use shared UI helpers from `packages/ui` and keep dependencies minimal.

## Style Guide

- Keep frontend modules small and framework-free.
- Use clear commit messages.
- Prefer smaller, incremental PRs.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
