/**
 * @jest-environment jsdom
 */

import { ChallengeEngine } from '../index.js';

describe('ChallengeEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new ChallengeEngine();
  });

  test('complete() is idempotent for same type', () => {
    engine.complete('quiz', 10);
    engine.complete('quiz', 20);
    expect(engine.getProgress().completed).toEqual(['quiz']);
    expect(engine.getProgress().totalScore).toBe(10);
  });

  test('complete() emits events only once per type', () => {
    const handler = jest.fn();
    engine.on('challenge:completed', handler);
    engine.complete('quiz', 10);
    engine.complete('quiz', 20);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ type: 'quiz', score: 10 });
  });

  test('evaluateUnlocks() returns matching unlock keys', () => {
    engine.complete('quiz', 10);
    engine.complete('dragDrop', 10);
    const rules = [
      { challenges: 2, score: 15, unlock: 'resume' },
      { challenges: 3, score: 25, unlock: 'contact' },
    ];
    expect(engine.evaluateUnlocks(rules)).toEqual(['resume']);
  });

  test('evaluateUnlocks() returns empty array when no rules match', () => {
    engine.complete('quiz', 5);
    expect(engine.evaluateUnlocks([{ challenges: 5, score: 50, unlock: 'all' }])).toEqual([]);
  });

  test('getProgress() returns copy-safe objects', () => {
    engine.complete('quiz', 10);
    const p1 = engine.getProgress();
    const p2 = engine.getProgress();
    expect(p1).not.toBe(p2);
    expect(p1.scores).not.toBe(p2.scores);
    expect(p1.completed).not.toBe(p2.completed);
  });

  test('reset() clears state', () => {
    engine.complete('quiz', 10);
    engine.reset();
    expect(engine.getProgress().count).toBe(0);
    expect(engine.getProgress().totalScore).toBe(0);
  });
});
