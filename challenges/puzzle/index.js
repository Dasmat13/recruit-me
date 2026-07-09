/**
 * Puzzle Challenge (placeholder)
 *
 * Extend with a custom mini-puzzle or grid logic challenge.
 */

export const metadata = {
  title: 'Puzzle',
  description: 'A general-purpose puzzle challenge template for contributors.',
  difficulty: 'medium',
  estimatedMinutes: 3,
  tags: ['puzzle'],
};

export function init(container, engine) {
  container.innerHTML = `
    <h3>Puzzle challenge</h3>
    <p class="challenge-body">Replace this challenge content with a custom puzzle module.</p>
    <button id="puzzle-complete" class="btn btn-primary" type="button">Mark complete</button>
  `;
  const btn = container.querySelector('#puzzle-complete');
  if (btn) {
    btn.onclick = () => {
      if (engine && typeof engine.complete === 'function') {
        engine.complete('puzzle', 10);
      }
    };
  }
}

export function cleanup(container) {
  if (container) container.innerHTML = '';
}
