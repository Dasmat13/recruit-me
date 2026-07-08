# Contributing to Recruit Me If You Can

Thank you for your interest in contributing to **Recruit Me If You Can**! This is a portfolio & recruiter-evaluation project built with plain HTML/CSS/JS and an Express + MongoDB backend. All contributions — bug reports, documentation improvements, and feature proposals — are welcome.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How to Contribute](#how-to-contribute)
3. [Bug Reports](#bug-reports)
4. [Feature Requests](#feature-requests)
5. [Pull Requests](#pull-requests)
6. [Development Setup](#development-setup)
7. [Style Guide](#style-guide)

## Code of Conduct

By participating, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior to the maintainers.

## How to Contribute

- Check [open issues](https://github.com/Dasmat13/recruit-me/issues) for tasks labeled `good first issue` or `help wanted`.
- If you plan to work on a larger change, please **open an issue first** to discuss scope and avoid duplicate effort.

## Bug Reports

Use the [Bug Report](https://github.com/Dasmat13/recruit-me/issues/new?template=bug_report.md) issue template. Include:
- Steps to reproduce
- Expected vs actual behavior
- Browser / Node version
- Screenshots if relevant

## Feature Requests

Use the [Feature Request](https://github.com/Dasmat13/recruit-me/issues/new?template=feature_request.md) issue template. Describe the user value, alternatives considered, and a rough implementation plan if possible.

## Pull Requests

1. Fork the repo and create your branch from `main`.
2. Install dependencies:
   ```bash
   cd server && npm install
   ```
3. Make your changes. Keep commits atomic and descriptive.
4. Run tests (if applicable) before submitting:
   ```bash
   cd server && npm test
   ```
5. Open a PR and reference the issue (e.g. `Closes #4`).

## Development Setup

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- npm

### Frontend
Open `index.html` in your browser or serve via any static server:
```bash
python3 -m http.server 8000
# or
npx serve .
```

### Backend
```bash
cd server
cp .env.example .env   # fill in MONGO_URI, etc.
npm install
npm run dev            # starts on http://localhost:3001
```

### Docker
```bash
docker-compose up --build
```

## Style Guide

- **Frontend:** Keep vanilla JS and CSS; no build tools required.
- **Backend:** Follow existing Express patterns (route -> controller -> model).
- **Commits:** Use clear, present-tense messages (e.g. `Add resume PDF download`).
- **Names:** Use descriptive variable and function names.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
