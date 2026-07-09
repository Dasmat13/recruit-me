/**
 * Memory Game Challenge
 *
 * A lightweight memory card matching mini-game for portfolios.
 */

export function init(container) {
  const items = ['🐙', '🚀', '☸️', '🔐', '📦', '🧪'];
  const cards = [...items, ...items];
  cards.sort(() => Math.random() - 0.5);

  container.innerHTML = '<h3>Memory: Match the DevOps icons.</h3>';
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
  grid.style.gap = '0.5rem';
  grid.style.maxWidth = '320px';
  container.appendChild(grid);

  let flipped = [];

  cards.forEach((symbol, idx) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.symbol = symbol;
    card.dataset.idx = idx;
    card.innerHTML = '<div class="memory-back">?</div><div class="memory-front">' + symbol + '</div>';
    card.style.border = '2px solid #000';
    card.style.padding = '1rem';
    card.style.textAlign = 'center';
    card.style.fontSize = '1.5rem';
    card.style.cursor = 'pointer';
    card.style.background = '#fff';
    card.onclick = () => {
      if (flipped.length >= 2 || card.classList.contains('flipped')) return;
      card.classList.add('flipped');
      card.innerHTML = symbol;
      flipped.push(card);
      if (flipped.length === 2) {
        const [a, b] = flipped;
        if (a.dataset.symbol === b.dataset.symbol) {
          a.style.background = '#d4edda';
          b.style.background = '#d4edda';
          flipped = [];
        } else {
          setTimeout(() => {
            a.classList.remove('flipped');
            b.classList.remove('flipped');
            a.innerHTML = '<div class="memory-back">?</div>';
            b.innerHTML = '<div class="memory-back">?</div>';
            flipped = [];
          }, 600);
        }
      }
    };
    grid.appendChild(card);
  });
}
