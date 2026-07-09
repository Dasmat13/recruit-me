/**
 * Terminal Challenge
 *
 * A lightweight terminal simulator that accepts a single expected command.
 */

export function init(container) {
  const expected = 'git status';
  let input = '';

  container.innerHTML = `
    <div class="terminal-card">
      <div class="terminal-titlebar">
        <span class="t-dot t-red"></span>
        <span class="t-dot t-yellow"></span>
        <span class="t-dot t-green"></span>
        <span class="t-filename">challenge</span>
      </div>
      <div class="terminal-body">
        <p>Type the command to see uncommitted changes:</p>
        <div class="t-input-row">
          <span class="t-prompt">$</span>
          <input type="text" class="t-input" autocomplete="off" />
        </div>
      </div>
    </div>
  `;

  const inputEl = container.querySelector('input');
  const body = container.querySelector('.terminal-body');

  inputEl.focus();
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = inputEl.value.trim();
      const line = document.createElement('p');
      line.className = 't-line';
      line.textContent = `$ ${val}`;
      body.appendChild(line);

      const out = document.createElement('p');
      out.className = 't-line';
      if (val === expected) {
        out.textContent = 'On branch main. Nothing to commit, working tree clean.';
        out.style.color = '#00E87E';
      } else {
        out.textContent = `Command "${val}" did not match expected input.`;
        out.style.color = '#FF3F3F';
      }
      body.appendChild(out);
      inputEl.value = '';
      body.scrollTop = body.scrollHeight;
    }
  });
}
