/**
 * Quiz Challenge
 *
 * Renders a multiple-choice quiz and reports completion/score to the engine.
 */

export function init(container) {
  const questions = [
    {
      prompt: 'Which technology do you prefer for container orchestration?',
      options: [
        { text: 'Docker Compose', points: 4 },
        { text: 'Kubernetes', points: 10 },
        { text: 'Podman', points: 8 },
        { text: 'None of the above', points: 0 },
      ],
    },
    {
      prompt: 'What does CI/CD stand for?',
      options: [
        { text: 'Continuous Integration / Continuous Delivery', points: 10 },
        { text: 'Code Integration / Code Deployment', points: 4 },
        { text: 'Continuous Improvement / Continuous Design', points: 0 },
      ],
    },
  ];

  let current = 0;
  let score = 0;

  function render() {
    const q = questions[current];
    container.innerHTML = '';

    const title = document.createElement('h3');
    title.textContent = `Quiz ${current + 1} / ${questions.length}`;
    container.appendChild(title);

    const prompt = document.createElement('p');
    prompt.textContent = q.prompt;
    container.appendChild(prompt);

    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.textContent = opt.text;
      btn.style.margin = '0.25rem';
      btn.onclick = () => {
        score += opt.points;
        current += 1;
        if (current >= questions.length) {
          renderResult();
        } else {
          render();
        }
      };
      container.appendChild(btn);
    });
  }

  function renderResult() {
    container.innerHTML = '';
    const heading = document.createElement('h3');
    heading.textContent = 'Quiz Complete';
    container.appendChild(heading);

    const summary = document.createElement('p');
    summary.textContent = `You scored ${score} / ${questions.length * 10}`;
    container.appendChild(summary);
  }

  render();
}
