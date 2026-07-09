# Recruit Me — Audit Report

**Date:** 2026-07-09  
**Scope:** Full audit of `recruit-me` as implemented in Prompt 2  
**Auditor:** Kilo  
**Status:** Findings with prioritized fixes

---

## Executive Summary

The codebase is structurally sound and follows the monorepo architecture defined in Prompt 1. The plugin contract is largely respected, and accessibility basics are in place. However, there are **critical gaps in guardrails** around duplicate challenge completion, **inconsistencies in the challenge registry naming**, **missing i18n**, and **no tests**. The demo app also imports every challenge eagerly, contradicting the “lazy-loaded plugins” intent from Prompt 1.

**Top-line risk:** A contributor can add a challenge that calls `engine.complete()` multiple times, inflating scores and unlocking content prematurely. There is no test coverage to catch this.

---

## 1. Critical Findings

### C-1: Duplicate challenge completion inflates score/unlocks
**Files:**
- `packages/challenge-engine/index.js`
- `challenges/terminal/index.js`
- `challenges/memory-game/index.js`
- `challenges/drag-drop/index.js`
- `challenges/code-review/index.js`

**Problem:** `ChallengeEngine.complete()` unconditionally pushes to `state.completed` and emits events. Several challenges call `engine.complete()` on every interaction
- Terminal: every Enter after correct answer
- Memory: each matched pair could race if not guarded
- Drag-drop / code-review: every submit click

Even though `app.mjs` checks `completed.includes(type)` in `completeCurrent()`, the engine itself does not prevent duplicate scoring or duplicate event emissions. A malicious or buggy challenge module can bypass the app-level guard.

**Fix:**
1. Make `complete()` idempotent.
2. Emit events only once per type.

```diff
--- a/packages/challenge-engine/index.js
+++ b/packages/challenge-engine/index.js
@@ -46,8 +46,13 @@ export class ChallengeEngine {
   }
 
   complete(type, score = 0) {
-    this.state.completed.push(type);
-    this.state.scores[type] = score;
+    if (this.state.current === type) {
+      this.state.completed.push(type);
+    } else if (this.state.completed.includes(type)) {
+      return; // already completed, ignore duplicate
+    } else {
+      this.state.completed.push(type);
+    }
+    this.state.scores[type] = score;
     this.state.current = null;
     this._emit('challenge:completed', { type, score });
     this._emit('challenge:scored', { type, score });
```

### C-2: Challenge registry name inconsistency
**File:** `challenges/index.mjs`

**Problem:** The barrel exports both camelCase (`dragDrop`) and kebab-case (`drag-drop`) keys. `app.mjs` resolves by trying both. This doubles the surface area for typos and makes the plugin contract ambiguous.

**Fix:**
```diff
--- a/challenges/index.mjs
+++ b/challenges/index.mjs
@@ -23,9 +23,7 @@ export const challenges = {
 
 export const registry = {
   quiz: quiz,
-  'drag-drop': dragDrop,
-  dragDrop,
-  codeReview,
+  dragDrop: dragDrop,
+  codeReview: codeReview,
   terminal,
   memoryGame,
   puzzle,
 };
```

And simplify `resolveChallengeModule()` in `app.mjs` to a single lookup.

### C-3: Double config load / race in `loader.mjs` + `initApp()`
**Files:**
- `apps/demo-portfolio/loader.mjs`
- `apps/demo-portfolio/app.mjs`

**Problem:** `loader.mjs` imports `config.js` and passes it to `initApp()`. Inside `initApp()`, if `config` is falsy it tries `await import('./config.js')` again. If both execute, the module may be evaluated twice or `window.RECRUIT_ME_CONFIG` may be stale.

**Fix:**
```diff
--- a/apps/demo-portfolio/loader.mjs
+++ b/apps/demo-portfolio/loader.mjs
@@ -1,13 +1,11 @@
 import config from './config.js';
 import themes from '../../packages/themes/index.mjs';
 import { defaultEngine } from '../../packages/challenge-engine/index.mjs';
 import initApp from './app.mjs';
 
-if (config && config.theme) {
-  themes.applyTheme(config.theme);
-}
+themes.applyTheme(config?.theme || 'minimal');
 
 window.__recruitMeEngine = defaultEngine;
 
-initApp({ config, engine: defaultEngine });
+initApp({ config, engine: defaultEngine });
```

And remove the redundant `await import('./config.js')` fallback in `app.mjs`.

---

## 2. High Findings

### H-1: `renderList()` uses `innerHTML` without sanitization
**File:** `packages/ui/index.js`

**Problem:** `renderList(items, template)` sets `innerHTML` from `template(item)`. If a challenge passes user-generated content into the template, this is an XSS vector. `escapeHtml()` exists but is not used here.

**Fix:**
```diff
--- a/packages/ui/index.js
+++ b/packages/ui/index.js
@@ -33,7 +33,7 @@ export function renderList(items, template) {
   items.forEach((item) => {
     const el = document.createElement('div');
     el.className = 'challenge-list-item';
-    el.innerHTML = typeof template === 'function' ? template(item) : template;
+    el.innerHTML = typeof template === 'function' ? escapeHtml(template(item)) : escapeHtml(template);
     container.appendChild(el);
   });
   return container;
```

### H-2: No guard against double-clicks / rapid replay
**Files:** All challenge modules, `app.mjs`

**Problem:** Users can click submit multiple times or use browser back/forward to replay challenges, inflating scores. There is no cooldown or completion lock at the challenge level.

**Fix:** Add a completion guard in `app.mjs` before calling `completeCurrent()`:

```js
function completeCurrent() {
  const type = state.order[state.index];
  if (engine.getProgress().completed.includes(type)) {
    ui.showToast('Already completed.', 'warning');
    return;
  }
  // ...
}
```

Also add a `completed` data attribute to the challenge card and disable the submit button after completion.

### H-3: Theme fallback mismatch
**File:** `packages/themes/index.js`

**Problem:** `applyTheme()` falls back to `themes.minimal` when a theme key is missing, but `config.js` defaults to `'retro'`. If a contributor misspells a theme key in their config, the app silently switches to Minimal instead of the intended theme.

**Fix:** Either validate the theme key early in `app.mjs` or make the fallback explicit in the error message.

```js
function validateConfig(cfg) {
  const required = ['candidateName', 'candidateRole', 'theme', 'difficulty'];
  const missing = required.filter((k) => !cfg || cfg[k] === undefined || cfg[k] === '');
  if (!missing.includes('theme') && !themes.listThemeIds().includes(cfg.theme)) {
     missing.push('theme');
  }
  return missing;
}
```

### H-4: Missing i18n string fallback
**Files:** All template strings in HTML/challenges

**Problem:** The architecture promises i18n, but all strings are hardcoded. A screen-reader user in a non-English locale gets no fallback.

**Fix:** Add a minimal `i18n` shim in `packages/ui`:

```js
const translations = { en: {} };
export function t(key, fallback) {
  return translations.en[key] || fallback || key;
}
```

Then replace hardcoded strings with `t('quiz.complete', 'Quiz Complete')`. This keeps the bundle tiny while providing an extension point.

---

## 3. Medium Findings

### M-1: Eager import of all challenges
**File:** `apps/demo-portfolio/app.mjs`, `challenges/index.mjs`

**Problem:** All challenges are imported at startup, contradicting Prompt 1’s “lazy-loaded plugins” intent. The initial JS payload includes every challenge module even if the visitor only plays one.

**Fix:** Use dynamic `import()` in `resolveChallengeModule()`:

```js
async function resolveChallengeModule(name) {
  const norm = normalizeChallengeName(name);
  const map = {
    quiz: () => import('../challenges/quiz/index.js'),
    dragDrop: () => import('../challenges/drag-drop/index.js'),
    // ...
  };
  const loader = map[norm];
  if (!loader) return null;
  try {
    const mod = await loader();
    return mod.default || mod;
  } catch {
    return null;
  }
}
```

And make `renderChallenge()` async.

### M-2: Duplicate `index.mjs` shim files
**Files:** `packages/*/index.mjs`

**Problem:** Every package has `index.mjs` that just re-exports `./index.js`. This is dead weight.

**Fix:** Either set `"main": "index.mjs"` in package.json and write real implementations there, or remove the shims and update imports to use `index.js`.

### M-3: `viewPortfolioDirectly()` bypasses all unlocks
**File:** `apps/demo-portfolio/app.mjs`

**Problem:** The “View Portfolio Directly” button reveals every link unconditionally. This is fine UX-wise, but if the intent is to gate content behind challenges, this is a bypass. Document the intent explicitly.

**Fix:** Add a comment or feature flag:
```js
function viewPortfolioDirectly() {
  if (config && config.allowSkip === false) {
    ui.showToast('Complete at least one challenge to unlock.', 'warning');
    return;
  }
  Object.keys(UNLOCK_LINK).forEach(revealUnlock);
  showUnlockScreen();
}
```

### M-4: Achievement spam risk
**File:** `apps/demo-portfolio/app.mjs`

**Problem:** `grantAchievement('firstSolved')` is called in `completeCurrent()`, which runs after every challenge, but `grantAchievement` is idempotent. However, `bugHunter` and `cicdMaster` are keyed to challenge type, meaning replaying the same challenge type won’t re-grant. This is correct but should be documented.

### M-5: No cleanup on reset
**File:** `apps/demo-portfolio/app.mjs`

**Problem:** `engine.reset()` clears state, but active challenge modules may have pending timers or listeners (e.g., `memory-game`’s `setTimeout`, `terminal`’s `keydown` listener).

**Fix:** Call `module.cleanup?.(container)` in `engine.reset()` or when advancing slides.

---

## 4. Low Findings

### L-1: `prettify()` is naive
**File:** `apps/demo-portfolio/app.mjs`

**Problem:** `prettify('memoryGame')` → `'Memory Game'`, but `prettify('dragDrop')` → `'Drag Drop'` instead of `'Drag-Drop'` or `'Drag Drop'`.

**Fix:** Use a lookup map for display names instead of regex.

### L-2: Unused `normalizeChallengeName()`
**File:** `apps/demo-portfolio/app.mjs`

**Problem:** The function just returns the same value for every known key.

**Fix:** Remove it or make it actually normalize kebab-case ↔ camelCase.

### L-3: Duplicate event listener risk
**File:** `apps/demo-portfolio/app.mjs`

**Problem:** `wireEvents()` adds a document-level `keydown` listener every time it’s called. If `showScreen('landing')` triggers a re-render that calls `wireEvents()` again, listeners pile up.

**Fix:** Track whether events are wired.

---

## 5. Security Review

| Area | Status | Notes |
|------|--------|-------|
| JSON parsing | Pass | `localStorage` access is wrapped in try/catch. No `eval()`. |
| XSS in challenges | Pass with caveat | All challenge content is hardcoded strings. `ui.createCard()` escapes title. `renderList()` does not escape template output — see H-1. |
| Prototype pollution | Pass | No deep-merge of user objects into prototypes. |
| Config injection | Pass | `config.js` is local; no remote fetch. |
| DOM clobbering | Pass | IDs are static and prefixed. |

**Recommendation:** Add a Content Security Policy meta tag to `index.html` to mitigate any future third-party script risk.

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" />
```

---

## 6. Edge-Case Analysis

| Scenario | Current Behavior | Desired Behavior |
|----------|------------------|------------------|
| Missing `config.js` | `readConfig` shows error card and aborts | Same, but with clearer fallback instructions |
| Unsupported theme name | Silently falls back to Minimal | Show warning toast + fallback |
| Rapid skip/continue | Can click Continue before challenge finishes | Disable Continue until challenge signals completion |
| Screen-reader unlock flow | Unlock links appear but not announced if hidden | Use `aria-live` on unlock container |
| Back button during challenge | Returns to landing, resets engine | Show “Unsaved progress will be lost” or auto-resume |
| i18n missing string | Hardcoded English text | Fallback to English + console warn |

---

## 7. Performance

| Item | Finding |
|------|---------|
| Bundle size | All challenges eagerly bundled. Estimated ~60-80KB gzipped. Should be <20KB for landing-only users. |
| Animation jank | `slideUp`/`fadeIn` use inline styles + transitions. No `will-change`. Add `will-change: transform, opacity` during animation and remove after. |
| Theme switch | Writes 7 CSS custom properties. Negligible cost. |
| LocalStorage reads | `loadAchievements()` called on every `grantAchievement()`. Cache the value per session. |

---

## 8. Test Generation (Required)

### 8.1 Unit tests — `packages/challenge-engine`
**File:** `packages/challenge-engine/__tests__/engine.test.js` (new)

```js
import { ChallengeEngine } from '../index.js';

describe('ChallengeEngine', () => {
  let engine;
  beforeEach(() => {
    engine = new ChallengeEngine();
  });

  test('complete() is idempotent', () => {
    engine.complete('quiz', 10);
    engine.complete('quiz', 20);
    expect(engine.getProgress().completed).toEqual(['quiz']);
    expect(engine.getProgress().totalScore).toBe(10);
  });

  test('evaluateUnlocks() returns matching rules', () => {
    engine.complete('quiz', 10);
    engine.complete('dragDrop', 10);
    const rules = [{ challenges: 2, score: 15, unlock: 'resume' }];
    expect(engine.evaluateUnlocks(rules)).toEqual(['resume']);
  });

  test('dispatchAchievements() persists only new ids', () => {
    const storage = {};
    const result = engine.dispatchAchievements(
      [{ id: 'a' }, { id: 'b' }],
      'test-key',
      { getItem: (k) => storage[k] || null, setItem: (k, v) => { storage[k] = v; } }
    );
    expect(result.map(i => i.id)).toEqual(['a', 'b']);
    const again = engine.dispatchAchievements([{ id: 'a' }], 'test-key', storage);
    expect(again).toEqual([]);
  });
});
```

### 8.2 Unit tests — config validator
**File:** `apps/demo-portfolio/__tests__/config.test.js` (new)

```js
import { validateConfig } from '../app.mjs';

describe('validateConfig', () => {
  test('flags missing required fields', () => {
    expect(validateConfig({})).toEqual(['candidateName','candidateRole','theme','difficulty']);
  });
  test('rejects empty strings', () => {
    expect(validateConfig({ candidateName: '', candidateRole: 'x', theme: 'retro', difficulty: 'easy' }))
      .toContain('candidateName');
  });
});
```

### 8.3 Component test — quiz challenge happy path
**File:** `challenges/quiz/__tests__/index.test.js` (new)

```js
import { init, cleanup } from '../index.js';

describe('quiz challenge', () => {
  let container, engine;
  beforeEach(() => {
    container = document.createElement('div');
    engine = { complete: jest.fn() };
  });

  test('renders first question', () => {
    init(container, engine);
    expect(container.textContent).toContain('container orchestration');
  });

  test('submits score on finish', () => {
    init(container, engine);
    const buttons = container.querySelectorAll('button');
    buttons[0].click(); // first answer
    buttons[0].click(); // second answer (second question)
    buttons[0].click(); // third answer
    const submit = container.querySelector('button:last-child');
    submit.click();
    expect(engine.complete).toHaveBeenCalledWith('quiz', expect.any(Number));
  });

  test('cleanup removes DOM', () => {
    init(container, engine);
    cleanup(container);
    expect(container.innerHTML).toBe('');
  });
});
```

### 8.4 Integration test — recruiter mode unlock flow
**File:** `apps/demo-portfolio/__tests__/flow.test.js` (new)

```js
import { initApp } from '../app.mjs';

describe('recruiter mode integration', () => {
  beforeAll(() => {
    window.RECRUIT_ME_CONFIG = {
      candidateName: 'Test',
      candidateRole: 'Dev',
      theme: 'minimal',
      difficulty: 'easy',
      contact: { resume: '#', github: '#', linkedin: '#', email: 'a@b.com' },
      unlockRules: [{ challenges: 1, score: 1, unlock: 'resume' }],
    };
  });

  test('completing one challenge unlocks resume', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    await initApp();
    // simulate clicking recruiter path
    document.querySelector('[data-mode="recruiter"]').click();
    // simulate completing quiz with score >=1
    // ... interact with DOM ...
    expect(document.querySelector('.unlock-links li[data-link="resume"]').classList).not.toContain('hidden');
  });
});
```

### 8.5 Accessibility test pass
Use `axe-core` or manual checklist:
- Skip link is focusable and jumps to `#main`
- Path selector has `role="group"` and `aria-label`
- Challenge container has `aria-live="polite"`
- Buttons have visible focus ring (`:focus-visible`)
- `prefers-reduced-motion` disables animations

Add a lightweight automated check:

```js
// a11y.test.js
test('challenge root has aria-live', () => {
  expect(document.getElementById('challenge-root').getAttribute('aria-live')).toBe('polite');
});
test('path cards are buttons', () => {
  document.querySelectorAll('.path-card').forEach(btn => {
    expect(btn.tagName).toBe('BUTTON');
  });
});
```

---

## 9. Deployment Readiness

| Item | Status | Action |
|------|--------|--------|
| Build script for `apps/demo-portfolio` | Pass | `package.json` has `dev` script using `serve` |
| Build script for `apps/docs` | Fail | No build step; docs are raw Markdown. For Vercel, add a simple static build or serve as-is. |
| Env config check | Pass | No secrets in frontend; backend is optional |
| CI pipeline | Fail | No `.github/workflows/*.yml` present for the monorepo. Add lint + test + typecheck. |
| `vercel.json` | Pass | Present at root for frontend deploy |
| `docker-compose.yml` | Pass | Present, though it references the old server location |

### CI pipeline recommendation (`.github/workflows/ci.yml`)

```yaml
name: CI

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm test --workspaces --if-present
```

---

## 10. Documentation Review

| File | Match to Code | Gaps |
|------|--------------|------|
| `README.md` | Good overview | Still references `app.js` in project tree; says “No build step” while monorepo now uses workspaces. |
| `CONTRIBUTING.md` | Good | Backend instructions reference `server/` which still exists; should note that frontend-only contributions don’t need MongoDB. |
| `apps/docs/guide.md` | Mostly accurate | Says `challenges/<type>/index.js` must `export function init(container)`, but actual contract is `init(container, engine)`. Also omits `metadata` export. |

### Concrete doc fixes

```diff
--- a/apps/docs/guide.md
+++ b/apps/docs/guide.md
@@ -68,7 +68,7 @@
 
 ```js
 // challenges/my-challenge/index.js
-export function init(container) {
+export function init(container, engine) {
   container.innerHTML = `
     <h3>My challenge</h3>
     <p>Render your interactive content into the provided container.</p>
@@ -82,6 +82,10 @@
 - `init(container)` receives a DOM element (`.challenge-body`) to render into.
 - Optionally export `metadata.title`, `metadata.difficulty`, `metadata.tags`.
 - Do **not** hard-depend on the engine; the app orchestrates completion and scoring.
+- `cleanup(container)` is called when the challenge is removed. Use it to remove
+  listeners, clear timers, and reset state.
+- Do **not** call `engine.complete()` more than once per challenge session.
+- All user-facing strings should be wrapped in a future i18n helper.
```

---

## 11. Production Readiness Checklist

| Item | Pass/Fail | Notes |
|------|-----------|-------|
| Plugin contract enforced | Fail | No schema/Zod validation for challenge modules; missing `cleanup()` is silent. |
| Error boundaries on every challenge | Partial | `app.mjs` wraps init, but individual challenges still throw uncaught errors in async handlers (e.g., `setTimeout` callbacks). |
| Config validation | Pass | Required fields checked; clear error shown. |
| Theme validation | Fail | Invalid theme silently falls back to Minimal. |
| Accessibility baseline | Partial | Good keyboard/screen-reader basics, but no `aria-live` on unlock container for announcement. |
| i18n | Fail | No translation layer; hardcoded strings. |
| Tests | Fail | Zero tests in repo. |
| CI/CD pipeline | Fail | No workflow files. |
| Bundle size / lazy loading | Fail | All challenges eagerly imported. |
| Security (XSS/injection) | Partial | No sanitization in `renderList`; no CSP. |
| Performance | Partial | No lazy loading; animations lack `will-change`. |
| Documentation accuracy | Partial | Guide omits `engine` param and `cleanup()`. |

---

## 12. Prioritized Action Plan

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| P0 | Make `ChallengeEngine.complete()` idempotent | Small | Prevents score inflation and duplicate events |
| P0 | Fix challenge registry naming consistency | Small | Removes ambiguity for contributors |
| P0 | Fix double config load in `loader.mjs` + `initApp()` | Small | Prevents stale config on reload |
| P1 | Add challenge completion guard in `app.mjs` | Small | Prevents double-click / replay abuse |
| P1 | Sanitize `renderList()` template output | Small | Closes XSS vector |
| P1 | Add CI workflow | Medium | Required for GSSoC external contributions |
| P1 | Write engine + config unit tests | Medium | Catches regressions in core logic |
| P1 | Lazy-load challenges with dynamic `import()` | Medium | Cuts initial bundle by ~60KB |
| P2 | Validate theme keys in `readConfig()` | Small | Fails fast on bad config |
| P2 | Add `cleanup()` calls on reset/advance | Small | Prevents memory leaks |
| P2 | Add i18n shim (`t()`) | Medium | Enables future translations |
| P2 | Update authoring guide to match actual API | Small | Reduces contributor confusion |
| P3 | Add `will-change` / animation cleanup | Small | Smoother UX on low-end devices |
| P3 | Add CSP meta tag | Small | Defense-in-depth |

---

*End of audit. All Critical and High items should be addressed before marking the repo GSSoC-ready.*
