# Recruit Me Architecture

## Monorepo Layout

```
recruit-me/
├── apps/
│   ├── demo-portfolio/      # Working portfolio demo shipped with the repo
│   └── docs/                # Documentation site (future)
│
├── packages/
│   ├── challenge-engine/    # Core runtime, scoring, challenge registry
│   ├── ui/                  # Shared UI primitives
│   ├── animations/          # Shared animations and transitions
│   └── themes/              # Theme tokens and switch logic
│
├── challenges/
│   ├── quiz/
│   ├── drag-drop/
│   ├── terminal/
│   ├── code-review/
│   ├── puzzle/
│   └── memory-game/
│
├── docs/
├── examples/
├── templates/
├── server/                  # Optional backend API for results/analytics
└── package.json             # Root package if monorepo workspaces are added later
```

## Current State

Today the repo is a vanilla JS/HTML/CSS app under `apps/demo-portfolio`.
The challenge system is implemented as embedded app.js code.
Community packages under `packages/` and `challenges/` are scoped for future extraction.

## Contribution Areas

- **Frontend** — refine the demo portfolio UI and add new themes.
- **Challenges** — build new challenge modules under `challenges/*`.
- **Animation** — improve UX with shared animations in `packages/animations`.
- **Docs** — write challenge authoring guides and API docs.
- **Backend** — improve the Express API and tests under `server/`.
