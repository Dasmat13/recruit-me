/**
 * Challenge Engine — core registry, scoring, and flow control.
 *
 * Each challenge type is a standalone module in ../challenges/*.
 */

export class ChallengeEngine {
  constructor() {
    this.registry = new Map();
    this.state = {
      current: null,
      completed: [],
      scores: {},
    };
  }

  register(type, module) {
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
  }

  complete(type, score = 0) {
    this.state.completed.push(type);
    this.state.scores[type] = score;
    this.state.current = null;
  }
}

export const defaultEngine = new ChallengeEngine();
