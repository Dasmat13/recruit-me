/**
 * @jest-environment jsdom
 */

import { validateConfig } from '../../apps/demo-portfolio/app.mjs';

describe('validateConfig', () => {
  test('returns missing required fields', () => {
    expect(validateConfig({})).toEqual([
      'candidateName',
      'candidateRole',
      'theme',
      'difficulty',
    ]);
  });

  test('rejects empty strings for required fields', () => {
    const cfg = {
      candidateName: '',
      candidateRole: 'x',
      theme: 'retro',
      difficulty: 'easy',
    };
    expect(validateConfig(cfg)).toContain('candidateName');
  });

  test('rejects unknown theme keys', () => {
    const cfg = {
      candidateName: 'A',
      candidateRole: 'B',
      theme: 'does-not-exist',
      difficulty: 'easy',
    };
    expect(validateConfig(cfg)).toContain('theme');
  });

  test('passes with valid config', () => {
    const cfg = {
      candidateName: 'A',
      candidateRole: 'B',
      theme: 'terminal',
      difficulty: 'easy',
    };
    expect(validateConfig(cfg)).toEqual([]);
  });
});
