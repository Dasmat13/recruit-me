/**
 * Code Review Challenge — Bug Hunt
 *
 * Spot the issue in a small CI/config snippet.
 * Reports completion and score to the engine.
 */

export const metadata = {
  title: 'Bug Hunt',
  description: 'Find the bug in this workflow.',
  difficulty: 'easy',
  estimatedMinutes: 1,
  tags: ['ci', 'debug', 'code-review'],
};

export function init(container, engine) {
  container.innerHTML = `
    <h3>Find the bug in this GitHub Actions workflow.</h3>
    <pre class="code-snippet"><code>name: CI
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
    <div class="options" role="group" aria-label="Answer choices">
      <button class="option-btn" type="button" data-answer="wrong" aria-label="It runs on the wrong event">It runs on the wrong event.</button>
      <button class="option-btn" type="button" data-answer="wrong" aria-label="It is missing node version setup">It is missing node version setup.</button>
      <button class="option-btn" type="button" data-answer="correct" aria-label="It never actually runs tests">It never actually runs tests.</button>
      <button class="option-btn" type="button" data-answer="wrong" aria-label="It uses v4 checkout which is too old">It uses v4 checkout which is too old.</button>
    </div>
    <p id="review-feedback" class="sr-only" aria-live="polite"></p>
  `;

  const buttons = container.querySelectorAll('.option-btn');
  const feedback = container.querySelector('#review-feedback');
  let answered = false;

  buttons.forEach((btn) => {
    btn.onclick = () => {
      if (answered) return;
      answered = true;
      buttons.forEach((b) => { b.disabled = true; b.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
      const correct = btn.dataset.answer === 'correct';
      if (feedback) feedback.textContent = correct ? 'Correct!' : 'Not quite.';
      if (engine && typeof engine.complete === 'function') {
        engine.complete('codeReview', correct ? 10 : 0);
      }
    };
  });
}

export function cleanup(container) {
  if (container) container.innerHTML = '';
}
