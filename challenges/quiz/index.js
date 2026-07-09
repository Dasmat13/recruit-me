/**
 * Quiz Challenge
 *
 * Renders a multiple-choice quiz. Correct answers may reveal fun facts.
 * Reports completion and score to the challenge engine.
 */

export const metadata = {
  title: 'Tech Preferences Quiz',
  description: 'Choose the best answer for each question.',
  difficulty: 'easy',
  estimatedMinutes: 1,
  tags: ['cloud', 'devops', 'quiz'],
};

export function init(container, engine) {
  const questions = [
    {
      prompt: 'Which technology do you prefer for container orchestration?',
      options: [
        { text: 'Docker Compose', points: 4 },
        { text: 'Kubernetes', points: 10 },
        { text: 'Podman', points: 8 },
        { text: 'None of the above', points: 0 },
      ],
      fact: 'Kubernetes remains the dominant orchestration platform at scale.',
    },
    {
      prompt: 'What does CI/CD stand for?',
      options: [
        { text: 'Continuous Integration / Continuous Delivery', points: 10 },
        { text: 'Code Integration / Code Deployment', points: 4 },
        { text: 'Continuous Improvement / Continuous Design', points: 0 },
      ],
      fact: 'CI/CD reduces deployment risk by catching issues earlier in the pipeline.',
    },
    {
      prompt: 'Which cloud provider is known for Lambda?',
      options: [
        { text: 'AWS', points: 10 },
        { text: 'Azure', points: 6 },
        { text: 'GCP', points: 6 },
        { text: 'DigitalOcean', points: 2 },
      ],
      fact: 'AWS Lambda popularized serverless functions in 2014.',
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

    q.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary option-btn';
      btn.type = 'button';
      btn.textContent = opt.text;
      btn.setAttribute('aria-label', `${opt.text} - ${opt.points} points`);
      btn.onclick = () => {
        score += opt.points;
        if (q.fact) {
          const note = document.createElement('p');
          note.className = 'fun-fact';
          note.textContent = `💡 ${q.fact}`;
          container.appendChild(note);
        }
        current += 1;
        if (current >= questions.length) {
          renderResult(score);
        } else {
          render();
        }
      };
      container.appendChild(btn);
    });
  }

  function renderResult(finalScore) {
    container.innerHTML = '';
    const heading = document.createElement('h3');
    heading.textContent = 'Quiz Complete';
    container.appendChild(heading);

    const summary = document.createElement('p');
    summary.textContent = `You scored ${finalScore} / ${questions.length * 10}`;
    container.appendChild(summary);

    const completeBtn = document.createElement('button');
    completeBtn.className = 'btn btn-primary';
    completeBtn.type = 'button';
    completeBtn.textContent = 'Submit';
    completeBtn.onclick = () => {
      if (engine && typeof engine.complete === 'function') {
        engine.complete('quiz', finalScore);
      }
    };
    container.appendChild(completeBtn);
  }

  render();
}

export function cleanup(container) {
  if (container) container.innerHTML = '';
}
