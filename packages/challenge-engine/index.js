/**
 * Challenge Engine — core registry, scoring, unlock evaluation,
 * and achievement dispatch for Recruit Me interactive portfolios.
 *
 * Public API:
 *  - register(type, module)
 *  - start(type, element)
 *  - complete(type, score)
 *  - getProgress()
 *  - reset()
 *  - on(event, handler)
 *  - off(event, handler)
 *  - evaluateUnlocks(rules)
 *  - dispatchAchievements(achievements, storageKey)
 */

export class ChallengeEngine {
  constructor() {
    this.registry = new Map();
    this.state = {
      current: null,
      completed: [],
      scores: {},
    };
    this._listeners = new Map();
  }

  register(type, module) {
    if (!module || typeof module.init !== 'function') {
      throw new Error(`Challenge module "${type}" must export an init(container) function.`);
    }
    this.registry.set(type, module);
  }

  get(type) {
    return this.registry.get(type);
  }

  start(type, element) {
    const module = this.registry.get(type);
    if (!module) throw new Error(`Challenge type "${type}" not registered.`);
    this.state.current = type;
    if (module.init) module.init(element);
    this._emit('challenge:started', { type });
  }

  complete(type, score = 0) {
    this.state.completed.push(type);
    this.state.scores[type] = score;
    this.state.current = null;
    this._emit('challenge:completed', { type, score });
    this._emit('challenge:scored', { type, score });
  }

  getProgress() {
    const scores = Object.values(this.state.scores || {});
    const totalScore = scores.reduce((sum, value) => sum + value, 0);
    return {
      completed: [...(this.state.completed || [])],
      scores: { ...(this.state.scores || {}) },
      count: (this.state.completed || []).length,
      totalScore,
    };
  }

  reset() {
    this.state.current = null;
    this.state.completed = [];
    this.state.scores = {};
  }

  on(event, handler) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    const set = this._listeners.get(event);
    if (set) set.delete(handler);
  }

  _emit(event, payload) {
    const set = this._listeners.get(event);
    if (!set) return;
    set.forEach((handler) => {
      try { handler(payload); } catch (err) { console.error(err); }
    });
  }

  evaluateUnlocks(rules) {
    const progress = this.getProgress();
    const results = [];
    for (const rule of rules || []) {
      const unlocked = progress.count >= rule.challenges && progress.totalScore >= rule.score;
      if (unlocked) results.push(rule.unlock);
    }
    return results;
  }

  dispatchAchievements(achievements, storageKey = 'recruit-me-achievements') {
    const unlocked = new Set(this._loadList(storageKey));
    const newlyUnlocked = [];
    for (const achievement of achievements || []) {
      if (!unlocked.has(achievement.id)) {
        unlocked.add(achievement.id);
        newlyUnlocked.push(achievement);
      }
    }
    if (newlyUnlocked.length) this._saveList(storageKey, Array.from(unlocked));
    return newlyUnlocked;
  }

  _loadList(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
  }

  _saveList(key, list) {
    try { localStorage.setItem(key, JSON.stringify(list)); } catch { /* ignore */ }
  }
}

export const defaultEngine = new ChallengeEngine();
export default ChallengeEngine;
