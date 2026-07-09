/**
 * Code Review Challenge
 *
 * Shows a small code snippet and asks the user to identify a bug.
 */

export function init(container) {
  container.innerHTML = `
    <h3>Find the bug in this GitHub Actions workflow.</h3>
    <pre style="background:#f6f8fa;padding:1rem;border-radius:8px;overflow:auto;"><code>name: CI
on: push
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Building..."
      - run: echo "Testing..."
      - run: deploy</code></pre>
    <p style="margin-top:1rem;">What is wrong with this workflow?</p>
    <div style="display:flex;flex-direction:column;gap:0.5rem;max-width:500px;">
      <button class="option-btn" data-answer="wrong">It runs on the wrong event.</button>
      <button class="option-btn" data-answer="wrong">It is missing node version setup.</button>
      <button class="option-btn" data-answer="correct">It never actually runs tests.</button>
      <button class="option-btn" data-answer="wrong">It uses v4 checkout which is too old.</button>
    </div>
  `;

  container.querySelectorAll('.option-btn').forEach(btn => {
    btn.onclick = () => {
      container.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
      const label = btn.dataset.answer === 'correct' ? '✅ Correct!' : '❌ Not quite.';
      const note = document.createElement('p');
      note.textContent = label;
      note.style.marginTop = '1rem';
      note.style.fontWeight = 'bold';
      container.appendChild(note);
    };
  });
}
