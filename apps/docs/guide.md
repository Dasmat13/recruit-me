# Recruit Me — Authoring Guide

This guide explains how to extend the **recruit-me** interactive portfolio
framework: how to add a new challenge type or theme, what the plugin contract
looks like, the folder conventions, and a checklist you can follow.

The demo app lives in `apps/demo-portfolio` and is fully vanilla
HTML/CSS/JS (ES modules, no framework, no build step).

---

## 1. Architecture at a glance

```
recruit-me/
├── packages/
│   ├── challenge-engine/   # ChallengeEngine: registry, scoring, flow
│   ├── ui/                 # createCard(), showToast()
│   ├── animations/         # fadeIn(), slideUp()
│   └── themes/             # themes map + applyTheme(name)
├── challenges/             # one folder per challenge type
│   ├── example/
│   ├── quiz/
│   ├── terminal/
│   └── ... (one self-contained module each)
└── apps/
    ├── demo-portfolio/     # the runnable demo app
    │   ├── config.js       # window.RECRUIT_ME_CONFIG (defaults)
    │   ├── index.html
    │   ├── style.css
    │   ├── app.mjs         # main controller
    │   └── loader.mjs      # entry point (loads config + starts app)
    └── docs/
        └── guide.md        # this file
```

The browser loads `index.html`, which pulls in `config.js` (sets
`window.RECRUIT_ME_CONFIG`) and then `loader.mjs`. `loader.mjs` applies the
theme and calls `initApp()` from `app.mjs`.

---

## 2. Folder conventions

| Location | Purpose |
| --- | --- |
| `packages/<name>/index.js` | A framework package. Exports a small API. |
| `packages/<name>/index.mjs` | Auto-generated ES-module shim (`export * from './index.js'`) so demo apps can import `index.mjs`. |
| `challenges/<type>/index.js` | A single challenge type. Must `export function init(container)`. |
| `challenges/index.mjs` | Barrel that re-exports every challenge namespace (`export * as quiz from './quiz/index.js'`). |
| `apps/demo-portfolio/config.js` | Per-candidate configuration. Sets `window.RECRUIT_ME_CONFIG` and `export default`s the same object. |

Naming rules:

- Challenge type keys are `camelCase` (`codeReview`, `dragDrop`, `memoryGame`).
- A challenge folder name must match its key (`challenges/codeReview`).
- Public package APIs are exported from `index.js` and re-shimmed to `index.mjs`.

---

## 3. Plugin contract

### 3.1 Challenge plugin

A challenge module is a plain ES module. The **only required export** is an
`init` function:

```js
// challenges/my-challenge/index.js
export function init(container) {
  container.innerHTML = `
    <h3>My challenge</h3>
    <p>Render your interactive content into the provided container.</p>
  `;
  // Wire up events here. When the user is done, the app calls
  // engine.complete(type, score) for you — you do NOT need to import the engine.
}
```

Contract rules:

- `init(container)` receives a DOM element (`.challenge-body`) to render into.
- Do **not** hard-depend on the engine; the app orchestrates completion and scoring.
- Keep it dependency-free and accessible (labels, `aria-*`, keyboard support).
- One folder = one challenge type.

To register it, add it to the barrel `challenges/index.mjs`:

```js
export * as myChallenge from './my-challenge/index.js';
```

Then reference it from a mode in `apps/demo-portfolio/app.mjs`:

```js
const MODE_CHALLENGES = {
  developer: ['codeReview', 'terminal', 'myChallenge'],
  // ...
};
```

### 3.2 Theme plugin

A theme is an entry in `packages/themes/index.js`:

```js
export const themes = {
  terminal: { name: 'Terminal', font: "'JetBrains Mono', monospace", background: '#0D0D0D', foreground: '#00E87E', accent: '#FF9F43', border: 'none' },
  retro:    { name: 'Retro Arcade', font: "'Space Grotesk', sans-serif", background: '#FFFFFF', foreground: '#000000', accent: '#FF3F3F', border: '3px solid #000' },
  // add yours:
  ocean:    { name: 'Ocean', font: 'system-ui, sans-serif', background: '#012a4a', foreground: '#caf0f8', accent: '#48cae4', border: '2px solid #48cae4' },
};

export function applyTheme(themeName) {
  const theme = themes[themeName] || themes.retro;
  const root = document.documentElement;
  root.style.setProperty('--font-main', theme.font);
  root.style.setProperty('--color-bg', theme.background);
  root.style.setProperty('--color-fg', theme.foreground);
  root.style.setProperty('--color-accent', theme.accent);
}
```

`applyTheme` writes CSS custom properties on `:root`; `style.css` consumes
`--font-main`, `--color-bg`, `--color-fg`, `--color-accent`. Add a new key to
`themes` and reference it via `config.theme`.

### 3.3 UI / engine helpers

- `ChallengeEngine.register(type, module)` and `start(type, el)` drive a challenge.
- `engine.complete(type, score)` records a result. `engine.getProgress()` returns
  `{ completed, scores, count, totalScore }`.
- `ui.createCard(title, html)` and `ui.showToast(message, type)` render UI.
- `animations.fadeIn(el)` / `animations.slideUp(el)` are opt-in transitions.

---

## 4. Config reference

`apps/demo-portfolio/config.js` exports the candidate config:

| Field | Required | Meaning |
| --- | --- | --- |
| `candidateName` | yes | Display name. |
| `candidateRole` | yes | Role / tagline. |
| `theme` | yes | Key in `packages/themes` (`'retro'`/`'terminal'`). |
| `difficulty` | yes | `'easy'` / `'medium'` / `'hard'` — selects challenge count. |
| `unlockRules` | no | Array of `{ challenges, score, unlock }`. `unlock` is `'resume'`, `'github'`, `'linkedin'`, or `'contact'`. |
| `contact` | no | `{ email, github, linkedin, resume }` used by the unlock screen. |

Default unlock rules (used when `unlockRules` is absent):

- 2 challenges **and** score ≥ 15 → reveal **Resume**.
- 3 challenges **and** score ≥ 25 → reveal **Contact**.

If validation fails, `app.mjs` shows a friendly error inside `#challenge-root`
and aborts gracefully.

---

## 5. Achievements

Stored in `localStorage` under `recruit-me-achievements` (array of ids):

- `firstVisit` — granted on first load.
- `firstSolved` — first completed challenge.
- `bugHunter` — `codeReview` challenge solved.
- `cicdMaster` — `terminal` challenge solved.

Add a new achievement by extending `ACHIEVEMENTS` in `app.mjs` and granting it
with `grantAchievement('yourId')`.

---

## 6. Accessibility notes

- The challenge container uses `aria-live="polite"`.
- Screens toggle `.hidden` **and** `aria-hidden`.
- Path selector buttons are native `<button>` (Enter/Space activate).
- `Escape` returns to the landing screen.
- Visible `:focus-visible` ring; `prefers-reduced-motion` disables animation.

---

## 7. Example: add a new challenge (checklist)

1. Create `challenges/wordle/index.js` with `export function init(container)`.
2. Render accessible interactive UI and wire events inside `init`.
3. Add `export * as wordle from './wordle/index.js';` to `challenges/index.mjs`.
4. Add `'wordle'` to a mode in `apps/demo-portfolio/app.mjs` `MODE_CHALLENGES`.
5. (Optional) List it in a `difficulty` branch of `challengesForMode`.
6. (Optional) Add an achievement or unlock rule in `config.js`.
7. Run `npm run dev` (serves on port 8000) and verify keyboard + screen-reader flow.

## 8. Example: add a new theme (checklist)

1. Add an entry to `themes` in `packages/themes/index.js`.
2. Ensure the object provides `font`, `background`, `foreground`, `accent`, `border`.
3. Set `config.theme` to your new key in `apps/demo-portfolio/config.js`.
4. Reload the demo and confirm `style.css` variables update correctly.

---

## 9. Running the demo

```bash
# from repo root
npm run dev          # runs apps/demo-portfolio dev server on :8000
# or directly:
cd apps/demo-portfolio
npm run dev          # npx serve -l 8000 .
```

No build step. Edit files and refresh the browser.
