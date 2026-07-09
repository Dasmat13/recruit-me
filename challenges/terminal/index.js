/**
 * Terminal Challenge
 *
 * A lightweight terminal simulator that accepts a single expected command.
 */

export const metadata = {
  title: 'Terminal Check',
  description: 'Type the right command.',
  difficulty: 'easy',
  estimatedMinutes: 1,
  tags: ['terminal', 'git'],
};

export function init(container, engine) {
  const expected = 'git status';

  container.innerHTML = `
    <div class="terminal-card challenge-card" role="region" aria-label="Terminal challenge">
      <div class="terminal-titlebar">
        <span class="t-dot t-red" aria-hidden="true"></span>
        <span class="t-dot t-yellow" aria-hidden="true"></span>
        <span class="t-dot t-green" aria-hidden="true"></span>
        <span class="t-filename" aria-hidden="true">challenge</span>
      </div>
      <div class="terminal-body">
        <p>Type the command to see uncommitted changes:</p>
        <label class="t-input-row" for="terminal-input">
          <span class="t-prompt" aria-hidden="true">$</span>
          <input id="terminal-input" class="t-input" type="text" autocomplete="off" aria-autocomplete="none" />
        </label>
        <p id="terminal-feedback" class="sr-only" aria-live="polite"></p>
      </div>
    </div>
  `;

  const inputEl = container.querySelector('#terminal-input');
  const body = container.querySelector('.terminal-body');
  const feedback = container.querySelector('#terminal-feedback');

  if (inputEl) inputEl.focus();

  if (inputEl) {
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
          if (feedback) feedback.textContent = 'Correct command.';
          if (engine && typeof engine.complete === 'function') engine.complete('terminal', 10);
        } else {
          out.textContent = `Command "${val}" did not match expected input.`;
          out.style.color = '#FF3F3F';
          if (feedback) feedback.textContent = 'Incorrect.';
        }
        body.appendChild(out);
        inputEl.value = '';
        body.scrollTop = body.scrollHeight;
      }
    });
  }
}

export function cleanup(container) {
  if (container) container.innerHTML = '';
}
