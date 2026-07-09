import ChallengeEngine from '../../packages/challenge-engine/index.mjs';
import * as ui from '../../packages/ui/index.mjs';
import * as animations from '../../packages/animations/index.mjs';
import * as themes from '../../packages/themes/index.mjs';
import * as challengesRegistry from '../../challenges/index.mjs';

const ACHIEVEMENTS_KEY = 'recruit-me-achievements';

const ACHIEVEMENTS = {
  firstVisit: { id: 'firstVisit', label: '🌟 First Visit' },
  firstSolved: { id: 'firstSolved', label: '🏅 First Challenge Solved' },
  bugHunter: { id: 'bugHunter', label: '🐛 Bug Hunter' },
  cicdMaster: { id: 'cicdMaster', label: '⚙️ CI/CD Master' },
};

const DEFAULT_RULES = [
  { challenges: 2, score: 15, unlock: 'resume' },
  { challenges: 3, score: 25, unlock: 'contact' },
];

const MODE_CHALLENGES = {
  recruiter: ['quiz', 'memoryGame'],
  developer: ['codeReview', 'terminal', 'dragDrop'],
  explorer: ['quiz', 'memoryGame', 'codeReview', 'terminal', 'dragDrop'],
};

const SCREENS = ['landing', 'flow', 'unlock-screen'];
const UNLOCK_LINK = {
  resume: 'resume',
  github: 'github',
  linkedin: 'linkedin',
  contact: 'contact',
};

const engine = new ChallengeEngine();
let config = null;
const state = { mode: null, order: [], index: 0 };

function normalizeChallengeName(name) {
  if (!name) return name;
  if (name === 'memoryGame') return 'memoryGame';
  if (name === 'dragDrop') return 'dragDrop';
  if (name === 'codeReview') return 'codeReview';
  if (name === 'terminal') return 'terminal';
  if (name === 'quiz') return 'quiz';
  if (name === 'puzzle') return 'puzzle';
  return name;
}

function resolveChallengeModule(name) {
  const norm = normalizeChallengeName(name);
  return challengesRegistry.registry?.[norm] || challengesRegistry.challenges?.[norm] || null;
}

function challengesForMode(mode, difficulty) {
  let list = [...(MODE_CHALLENGES[mode] || MODE_CHALLENGES.explorer)];
  if (difficulty === 'easy') list = list.slice(0, Math.min(2, list.length));
  else if (difficulty === 'hard') list = [...list, 'puzzle'];
  return list;
}

function validateConfig(cfg) {
  const required = ['candidateName', 'candidateRole', 'theme', 'difficulty'];
  return required.filter((k) => !cfg || cfg[k] === undefined || cfg[k] === '');
}

function showConfigError(missing) {
  const root = document.getElementById('challenge-root');
  if (root) {
    root.innerHTML = '';
    ui.withErrorBoundary(root, 'config-validation', () => {
      const card = ui.createCard(
        'Configuration error',
        `<p>The portfolio config is missing required fields: <strong>${missing.join(', ')}</strong>.</p>` +
          `<p>Edit <code>apps/demo-portfolio/config.js</code> and reload.</p>`
      );
      root.appendChild(card);
    });
  }
  showScreen('flow');
  ui.showToast('Missing config: ' + missing.join(', '), 'error');
}

function readConfig(fallback) {
  let cfg = fallback || window.RECRUIT_ME_CONFIG;
  const missing = validateConfig(cfg);
  if (missing.length) {
    showConfigError(missing);
    return null;
  }
  return cfg;
}

/* ---------- Achievements ---------- */
function loadAchievements() {
  try { return JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY)) || []; } catch { return []; }
}

function saveAchievements(list) {
  try { localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(list)); } catch { /* storage unavailable */ }
}

function grantAchievement(id) {
  const list = loadAchievements();
  if (list.includes(id)) return false;
  list.push(id);
  saveAchievements(list);
  const ach = ACHIEVEMENTS[id];
  if (ach) ui.showToast('Achievement unlocked: ' + ach.label, 'success');
  return true;
}

/* ---------- Screen management ---------- */
function showScreen(id) {
  SCREENS.forEach((s) => {
    const el = document.getElementById(s);
    if (!el) return;
    const active = s === id;
    el.classList.toggle('hidden', !active);
    el.setAttribute('aria-hidden', String(!active));
  });
  const focusTarget = {
    landing: '.path-card',
    flow: '#next-challenge',
    'unlock-screen': '#restart',
  }[id];
  if (focusTarget) {
    const target = document.querySelector(focusTarget);
    if (target) target.focus();
  }
}

/* ---------- Rendering ---------- */
function renderStepper() {
  const stepper = document.getElementById('progress-stepper');
  stepper.innerHTML = '';
  state.order.forEach((type, i) => {
    const li = document.createElement('li');
    li.className = 'step';
    const done = i < state.index;
    const current = i === state.index;
    li.dataset.state = done ? 'done' : current ? 'current' : 'upcoming';
    li.setAttribute('aria-current', current ? 'step' : 'false');
    li.innerHTML = '<span class="step-dot" aria-hidden="true"></span> ' + prettify(type);
    stepper.appendChild(li);
  });
}

function prettify(type) {
  return String(type)
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase());
}

function updateProgressBar() {
  const total = state.order.length || 1;
  const pct = Math.round((engine.getProgress().count / total) * 100);
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = pct + '%';
  const bar = document.querySelector('.progress-bar');
  if (bar) bar.setAttribute('aria-valuenow', String(pct));
}

function renderChallenge() {
  const root = document.getElementById('challenge-root');
  root.innerHTML = '';
  const type = state.order[state.index];
  const module = resolveChallengeModule(type);
  const label = module?.metadata?.title || prettify(type);
  const card = ui.createCard(`Challenge ${state.index + 1} of ${state.order.length}: ${label}`, '');
  root.appendChild(card);
  const body = card.querySelector('.challenge-body');

  const fallback = () => {
    if (module && typeof module.init === 'function') {
      module.init(body, engine);
      animations.slideUp(card);
    } else {
      throw new Error('Unknown challenge type: ' + type);
    }
  };

  ui.withErrorBoundary(root, 'challenge-init', fallback);
  const nextBtn = document.getElementById('next-challenge');
  if (nextBtn) nextBtn.textContent = state.index === state.order.length - 1 ? 'Finish' : 'Continue';
  updateProgressBar();
  ui.focusFirstInteractive(body);
}

/* ---------- Flow control ---------- */
function startMode(mode) {
  state.mode = mode;
  state.order = challengesForMode(mode, config.difficulty);
  state.index = 0;
  engine.reset();
  renderStepper();
  showScreen('flow');
  renderChallenge();
}

function completeCurrent() {
  const type = state.order[state.index];
  if (!engine.getProgress().completed.includes(type)) {
    engine.complete(type, 0);
  }
  grantAchievement('firstSolved');
  if (type === 'codeReview') grantAchievement('bugHunter');
  if (type === 'terminal') grantAchievement('cicdMaster');
  evaluateUnlocks();
  state.index += 1;
  if (state.index >= state.order.length) finishMode();
  else {
    renderStepper();
    renderChallenge();
  }
}

function finishMode() {
  updateProgressBar();
  showUnlockScreen();
}

function evaluateUnlocks() {
  const rules = (config && config.unlockRules && config.unlockRules.length) ? config.unlockRules : DEFAULT_RULES;
  const unlocked = engine.evaluateUnlocks(rules);
  unlocked.forEach(revealUnlock);
}

/* ---------- Unlock screen ---------- */
function setHref(id, value) {
  const el = document.getElementById(id);
  if (el && value) el.href = value;
}

function applyContactLinks() {
  const c = (config && config.contact) || {};
  setHref('link-resume', c.resume);
  setHref('link-github', c.github);
  setHref('link-linkedin', c.linkedin);
  const contact = document.getElementById('link-contact');
  if (contact && c.email) contact.href = 'mailto:' + c.email;
  const bio = document.getElementById('unlock-bio');
  if (bio) bio.textContent = ((config && config.candidateBio) || '').trim();
}

function revealUnlock(key) {
  const linkKey = UNLOCK_LINK[key];
  if (!linkKey) return;
  const li = document.querySelector('.unlock-links li[data-link="' + linkKey + '"]');
  if (li) {
    li.classList.remove('hidden');
    li.setAttribute('aria-hidden', 'false');
  }
}

function renderAchievements() {
  const wrap = document.getElementById('achievements');
  if (!wrap) return;
  wrap.innerHTML = '';
  const unlocked = loadAchievements();
  Object.values(ACHIEVEMENTS).forEach((a) => {
    if (!unlocked.includes(a.id)) return;
    const span = document.createElement('span');
    span.className = 'badge';
    span.dataset.new = 'true';
    span.textContent = a.label;
    wrap.appendChild(span);
  });
}

function showUnlockScreen() {
  applyContactLinks();
  renderAchievements();
  showScreen('unlock-screen');
}

function viewPortfolioDirectly() {
  Object.keys(UNLOCK_LINK).forEach(revealUnlock);
  showUnlockScreen();
}

/* ---------- Keyboard ---------- */
function onKeydown(e) {
  if (e.key === 'Escape') {
    const flow = document.getElementById('flow');
    const unlock = document.getElementById('unlock-screen');
    if (flow && !flow.classList.contains('hidden')) {
      engine.reset();
      showScreen('landing');
    } else if (unlock && !unlock.classList.contains('hidden')) {
      showScreen('landing');
    }
  }
}

/* ---------- Events ---------- */
function wireEvents() {
  document.querySelectorAll('.path-card').forEach((btn) => {
    btn.addEventListener('click', () => startMode(btn.dataset.mode));
  });

  const viewBtn = document.getElementById('view-portfolio');
  if (viewBtn) viewBtn.addEventListener('click', viewPortfolioDirectly);

  const nextBtn = document.getElementById('next-challenge');
  if (nextBtn) nextBtn.addEventListener('click', completeCurrent);

  const prevBtn = document.getElementById('prev-challenge');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (state.index > 0) {
        state.index -= 1;
        renderStepper();
        renderChallenge();
      }
    });
  }

  const restart = document.getElementById('restart');
  if (restart) {
    restart.addEventListener('click', () => {
      engine.reset();
      showScreen('landing');
    });
  }

  document.addEventListener('keydown', onKeydown);
}

/* ---------- Entry point ---------- */
export default async function initApp(ctx = {}) {
  config = ctx.config || window.RECRUIT_ME_CONFIG;
  if (!config) {
    try {
      await import('./config.js');
    } catch (err) {
      console.error('[recruit-me] could not load config.js', err);
    }
    config = window.RECRUIT_ME_CONFIG;
  }

  const validated = readConfig(config);
  if (!validated) return;
  config = validated;

  if (config.candidateRole) {
    const role = document.getElementById('candidate-role');
    if (role) role.textContent = config.candidateRole;
  }

  themes.applyTheme(config.theme);
  grantAchievement('firstVisit');
  applyContactLinks();
  wireEvents();
  showScreen('landing');
}
