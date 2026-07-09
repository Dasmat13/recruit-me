/**
 * Memory Game Challenge
 *
 * A lightweight memory card matching mini-game.
 */

export const metadata = {
  title: 'Memory Match',
  description: 'Match the DevOps icons.',
  difficulty: 'easy',
  estimatedMinutes: 1,
  tags: ['game', 'memory'],
};

export function init(container, engine) {
  const items = ['🐙', '🚀', '☸️', '🔐', '📦', '🧪'];
  const symbols = [...items, ...items];
  symbols.sort(() => Math.random() - 0.5);

  container.innerHTML = '<h3>Memory: Match the DevOps icons.</h3>';
  const grid = document.createElement('div');
  grid.className = 'memory-grid';
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
  grid.style.gap = '0.5rem';
  grid.style.maxWidth = '320px';
  container.appendChild(grid);

  let flipped = [];
  let completed = 0;
  const totalPairs = items.length;

  symbols.forEach((symbol, idx) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'memory-card';
    card.dataset.symbol = symbol;
    card.dataset.idx = idx;
    card.setAttribute('aria-label', 'Hidden card');
    card.innerHTML = '<span class="memory-back" aria-hidden="true">?</span><span class="memory-front" aria-hidden="true">' + symbol + '</span>';
    card.onclick = () => {
      if (flipped.length >= 2 || card.classList.contains('flipped')) return;
      card.classList.add('flipped');
      card.setAttribute('aria-label', symbol);
      flipped.push(card);
      if (flipped.length === 2) {
        const [a, b] = flipped;
        if (a.dataset.symbol === b.dataset.symbol) {
          a.style.background = 'var(--color-accent)';
          a.style.color = '#fff';
          b.style.background = 'var(--color-accent)';
          b.style.color = '#fff';
          completed += 1;
          flipped = [];
          if (completed === totalPairs && engine && typeof engine.complete === 'function') {
            engine.complete('memoryGame', 10);
          }
        } else {
          setTimeout(() => {
            a.classList.remove('flipped');
            b.classList.remove('flipped');
            a.setAttribute('aria-label', 'Hidden card');
            b.setAttribute('aria-label', 'Hidden card');
            flipped = [];
          }, 600);
        }
      }
    };
    grid.appendChild(card);
  });
}

export function cleanup(container) {
  if (container) container.innerHTML = '';
}
