/**
 * Barrel export for Recruit Me challenge modules.
 *
 * Import a challenge by name, e.g. `challenges['quiz']`.
 */

import * as quiz from './quiz/index.js';
import * as dragDrop from './drag-drop/index.js';
import * as codeReview from './code-review/index.js';
import * as terminal from './terminal/index.js';
import * as memoryGame from './memory-game/index.js';
import * as puzzle from './puzzle/index.js';

export const challenges = {
  quiz,
  dragDrop,
  codeReview,
  terminal,
  memoryGame,
  puzzle,
};

export const registry = {
  quiz: quiz,
  'drag-drop': dragDrop,
  dragDrop,
  codeReview,
  terminal,
  memoryGame,
  puzzle,
};

export default registry;
