# Recruit Me — Architecture & Implementation Blueprint

> **Tagline:** An interactive open-source portfolio where recruiters solve small DevOps, Cloud, and Backend challenges to unlock the candidate profile.

---

## 1. Requirements Analysis

### 1.1 Functional Requirements

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-1 | Mode routing | Visitors choose Recruiter, Developer, or Explorer paths. |
| FR-2 | Challenge engine | Load, start, score, and complete reusable challenge modules. |
| FR-3 | Unlock / gamification | Complete challenges to unlock resume, projects, and contact info. |
| FR-4 | Achievements | Award badges for milestones (first visit, first solve, bug hunter, etc.). |
| FR-5 | Theming | Switch between terminal, retro, cyberpunk, minimal, and custom themes. |
| FR-6 | i18n | Multi-language support for challenge text and UI. |
| FR-7 | Portfolio config | Candidate can configure name, role, skills, theme, and contact via JSON. |
| FR-8 | Admin dashboard | View recruiter submissions, analytics, and moderation queues. |
| FR-9 | Backend API | Optional API for storing results, submissions, and telemetry. |

### 1.2 Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | Performance | Demo portfolio loads in under 2s on 3G. |
| NFR-2 | Accessibility | WCAG 2.1 AA for all interactive challenges. |
| NFR-3 | Extensibility | New challenge types pluggable without core changes. |
| NFR-4 | Privacy | No raw PII in public API responses; optional telemetry. |
| NFR-5 | Browser support | Modern browsers: Chrome, Firefox, Safari, Edge (last 2 versions). |
| NFR-6 | Bundle size | Demo portfolio initial JS under 200KB gzipped. |
| NFR-7 | Offline support | PWA-ready with cached assets for demo portfolio. |

---

## 2. Monorepo Structure

```
recruit-me/
├── apps/
│   ├── demo-portfolio/          # Runnable portfolio demo
│   │   ├── config.js            # Candidate profile config
│   │   ├── index.html
│   │   ├── style.css
│   │   └── app.js
│   └── docs/                    # Documentation site (future)
│
├── packages/
│   ├── challenge-engine/        # Core runtime: registry, scoring, flow
│   │   ├── package.json
│   │   ├── index.js
│   │   ├── registry.js
│   │   └── scorer.js
│   │
│   ├── ui/                      # Shared UI primitives
│   │   ├── package.json
│   │   ├── index.js
│   │   ├── card.js
│   │   └── toast.js
│   │
│   ├── animations/              # Reusable animation presets
│   │   ├── package.json
│   │   └── index.js
│   │
│   └── themes/                  # Theme tokens and switch logic
│       ├── package.json
│       ├── index.js
│       ├── terminal.js
│       ├── retro.js
│       └── cyberpunk.js
│
├── challenges/
│   ├── quiz/                    # Multiple-choice challenges
│   ├── drag-drop/               # Drag and drop matching
│   ├── terminal/                # Terminal simulator
│   ├── code-review/             # Spot the bug snippets
│   ├── puzzle/                  # General puzzle template
│   ├── memory-game/             # Memory card mini-game
│   └── example/                 # Template for new challenge types
│
├── docs/
│   ├── architecture.md
│   ├── contributing.md
│   └── examples/
│
├── examples/
│   ├── minimal.md
│   ├── devops.md
│   └── frontend.md
│
├── templates/
│   └── portfolio-config.example.json
│
├── server/                      # Optional backend API
│   ├── index.js
│   ├── routes/
│   ├── models/
│   └── package.json
│
├── package.json                 # Root workspace / scripts
├── vercel.json                  # Deployment config
├── vercel-build.js              # Build step for static deploy
└── README.md
```

### 2.1 Package Boundaries and Public APIs

| Package | Responsibility | Public API |
|---------|----------------|------------|
| `challenge-engine` | Registry, lifecycle, scoring, unlock triggers | `register(type, module)`, `start(type, element)`, `complete(type, score)`, `getProgress()` |
| `ui` | Reusable DOM helpers | `createCard(title, html)`, `showToast(message, type)`, `renderList(items, template)` |
| `animations` | Animation presets | `fadeIn(el, duration)`, `slideUp(el, duration)`, `confetti(canvas)` |
| `themes` | Theme tokens and runtime switching | `applyTheme(name)`, `getToken(name)` |
| `challenges/*` | Self-contained challenge modules | `init(container)` — required; `score()` — optional; `cleanup()` — optional |

### 2.2 Challenge Plugin Contract

Every challenge module under `challenges/*` must export:

```ts
interface ChallengeModule {
  init(container: HTMLElement): void;
  score?(): number;
  cleanup?(): void;
  metadata?: {
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedMinutes: number;
    tags: string[];
  };
}
```

Rules:
- `init()` must render inside the provided container only.
- No global side effects outside `container`.
- Dependencies should be limited to `packages/ui` and browser APIs.
- Challenge modules must not load external frameworks.

---

## 3. Tech Stack Recommendation

| Layer | Choice | Justification |
|-------|--------|---------------|
| Frontend framework | Vanilla ES6+ (demo), optional React/Next.js for docs | Keeps demo portfolio zero-build; docs can use modern tooling. |
| Monorepo tool | npm workspaces or pnpm workspaces | Lightweight, no extra config needed for current scale. |
| State management | Plain JS objects + event emitters | Challenges are mostly local UI; no need for heavy state libs. |
| Animation | CSS transitions + lightweight JS helpers | Avoids heavy animation libraries; maintains performance. |
| i18n | Custom JSON dictionaries + `data-i18n` attributes | No runtime overhead; contributors add new languages as JSON files. |
| Backend | Express + MongoDB (optional) | Matches existing server; only needed for analytics/submissions. |
| Deployment | Vercel (frontend) + optional server | Already configured; zero-config for static assets. |

---

## 4. Data Design

### 4.1 Portfolio Config Schema

```json
{
  "candidateName": "string",
  "candidateRole": "string",
  "candidateBio": "string",
  "theme": "terminal | retro | cyberpunk | minimal",
  "difficulty": "easy | medium | hard",
  "paths": {
    "recruiter": true,
    "developer": true,
    "explorer": true
  },
  "challenges": ["quiz", "drag-drop", "terminal", "code-review"],
  "skills": ["string"],
  "contact": {
    "email": "string",
    "github": "url",
    "linkedin": "url"
  },
  "unlockResume": true,
  "achievements": [
    {
      "id": "first_visit",
      "title": "First Visit",
      "icon": "🏅",
      "unlocked": true
    }
  ]
}
```

### 4.2 Challenge Definition Schema

```json
{
  "id": "quiz-001",
  "type": "quiz",
  "title": "Tech Stack Preferences",
  "description": "Choose the technologies you prefer working with.",
  "difficulty": "easy",
  "estimatedMinutes": 1,
  "tags": ["cloud", "devops"],
  "config": {
    "questions": [
      {
        "prompt": "Which tool do you prefer for containerization?",
        "options": [
          { "text": "Docker", "points": 10 },
          { "text": "Podman", "points": 8 }
        ]
      }
    ]
  }
}
```

### 4.3 Achievement / Progress Schema

```json
{
  "sessionId": "string",
  "candidateId": "string",
  "visitorEmail": "string | null",
  "mode": "recruiter | developer | explorer",
  "startedAt": "ISO8601",
  "completedAt": "ISO8601 | null",
  "challenges": [
    {
      "challengeId": "string",
      "score": 0,
      "completed": false,
      "attempts": 0
    }
  ],
  "achievements": [
    {
      "id": "bug_hunter",
      "title": "Bug Hunter",
      "icon": "🐛",
      "earnedAt": "ISO8601"
    }
  ],
  "finalUnlock": {
    "resumeUnlocked": false,
    "contactUnlocked": false,
    "projectsUnlocked": false
  }
}
```

---

## 5. Challenge Engine Plugin API

### 5.1 Interface

```ts
interface ChallengeModule {
  init(container: HTMLElement): void;
  score?(): number;
  cleanup?(): void;
  metadata?: ChallengeMetadata;
}

interface ChallengeMetadata {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
  tags: string[];
}
```

### 5.2 Lifecycle Hooks

| Hook | When called | Purpose |
|------|-------------|---------|
| `init(container)` | Challenge starts | Render challenge UI inside container |
| `score()` | Challenge ends | Return numeric score; default 0 |
| `cleanup()` | Challenge unmounts | Remove listeners, cancel timers |

### 5.3 Scoring and Unlock Triggers

- Engine maintains `progress = { completed: [], scores: {} }`.
- When `complete(type, score)` is called:
  - Store score.
  - Check unlock thresholds from portfolio config.
  - Emit `unlock` event if threshold met.
  - Update achievement badges.

Example unlock rule:

```json
{
  "unlockResume": { "minChallenges": 2, "minScore": 15 },
  "unlockContact": { "minChallenges": 3, "minScore": 25 }
}
```

---

## 6. Theming System

### 6.1 Design

Themes are CSS variable bundles plus optional JS overrides.

```css
/* themes/terminal.css */
:root {
  --font-main: 'JetBrains Mono', monospace;
  --color-bg: #0D0D0D;
  --color-fg: #00E87E;
  --color-accent: #FF9F43;
  --border-width: 0px;
  --shadow: none;
}

/* themes/retro.css */
:root {
  --font-main: 'Space Grotesk', sans-serif;
  --color-bg: #FFFFFF;
  --color-fg: #000000;
  --color-accent: #FF3F3F;
  --border-width: 3px;
  --shadow: 5px 5px 0px #000;
}
```

### 6.2 Extension Contract

To add a new theme, a contributor:

1. Creates `packages/themes/<theme-name>.js` exporting a CSS string or token map.
2. Registers the theme in `packages/themes/index.js`.
3. Adds the theme name to `apps/demo-portfolio/config.js` if desired.

No core logic changes required.

---

## 7. OSS Contribution Scaffolding

### 7.1 CONTRIBUTING.md Outline

- Code of Conduct reference
- How to find issues (`good first issue`, `help wanted`, `challenge-type:quiz`)
- Branch naming: `feat/<slug>`, `fix/<slug>`, `challenge/<slug>`
- PR checklist
- Challenge authoring guide
- Theme authoring guide

### 7.2 Issue Label Taxonomy

| Label | Purpose |
|-------|---------|
| `good first issue` | Beginner-friendly tasks |
| `help wanted` | Needs community input |
| `challenge-type:quiz` | Quiz challenge work |
| `challenge-type:terminal` | Terminal simulator work |
| `theme:*` | Theme-specific changes |
| `area:frontend` | UI/CSS work |
| `area:backend` | API/work |
| `area:docs` | Documentation |
| `area:i18n` | Translations |
| `priority:high` | Roadmap blockers |

### 7.3 README.md Structure

- Tagline and elevator pitch
- User journeys (Recruiter / Developer / Explorer)
- Live demo link
- Quick start
- Customization guide
- Challenge types table
- Contributing section
- Roadmap
- License

### 7.4 “Good First Issue” Structure

Each good first issue should include:

- Clear problem statement
- Affected files
- Suggested approach
- Acceptance criteria
- Mentor/contact person

---

## 8. Roadmap

### Phase 1: MVP
- [x] Core recruiter evaluation flow
- [x] Challenge engine scaffold
- [x] Starter challenge modules (quiz, drag-drop, terminal)
- [x] Theme system with terminal and retro presets
- [x] GitHub Actions CI for tests

### Phase 2: GSSoC-Ready
- [ ] Ship challenge-engine v1 with tests
- [ ] Add 5+ community challenge modules
- [ ] Recruiter analytics (privacy-conscious)
- [ ] Mobile-optimized interactions
- [ ] i18n scaffolding with 2 languages
- [ ] Accessibility audit and fixes
- [ ] PWA offline mode for demo portfolio

### Phase 3: Future
- [ ] AI-generated interview challenge hints
- [ ] One-click resume PDF export
- [ ] Leaderboard
- [ ] Theme marketplace
- [ ] Voice-guided challenges
- [ ] Challenge authoring CLI tool

---

## 9. Key Technical Decisions, Tradeoffs, and Considerations

| Decision | Choice | Reasoning | Tradeoff |
|----------|--------|-----------|----------|
| Vanilla JS demo vs framework | Vanilla JS | Zero build friction; easy for beginners | Less scalable for very large UIs |
| Monorepo vs single repo | Monorepo | Clear separation of concerns; shared packages | Slightly more complex for first-time contributors |
| Client-side theming vs server-side | Client-side CSS vars | Instant switch; no server round-trip | Limited to what CSS can express |
| Public transforms for PII | Strip at API layer | Consistent with existing codebase | Requires maintenance when schema changes |
| Challenge sandboxing | None (trusted modules) | Simplicity for contributors | Malicious challenge code could run in browser |
| Telemetry opt-in | Default off | Privacy-first | Less insight into usage patterns |
| Backend optional | Express + MongoDB | Matches existing stack | Adds operational overhead for minimal benefit |

### Security Considerations
- All public API responses must pass through `toPublicDoubt()` / `toPublicReply()` transforms.
- Admin routes require `requireAdmin()` and validate inputs with Zod.
- Backend never stores raw TOTP secrets or backup codes.
- Rate limiting on all public write endpoints.

### Scalability Considerations
- Challenge modules are lazy-loaded where possible.
- Theme tokens are CSS custom properties to avoid repaint overhead.
- Backend analytics are batched and optional.

---

## 10. Quick-Start for Contributors

1. Clone the repo.
2. Run `cd apps/demo-portfolio && python3 -m http.server 8000`.
3. Open `http://localhost:8000`.
4. Pick a `good first issue` and start coding.

For challenge authors: copy `challenges/example/` into a new folder and register it in `apps/demo-portfolio/app.js`.

---

*Document generated as part of GSSoC '26 project preparation.*
