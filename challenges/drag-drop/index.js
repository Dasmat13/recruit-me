/**
 * Drag & Drop Challenge — Fix My Deployment
 *
 * Reorder CI/CD pipeline steps into the correct sequence.
 * Items: "Push", "Docker Build", "Tests", "Deploy"
 * Correct order: Push → Tests → Docker Build → Deploy
 */

export const metadata = {
  title: 'Fix My Deployment',
  description: 'Drag the pipeline steps into the correct order.',
  difficulty: 'medium',
  estimatedMinutes: 2,
  tags: ['cicd', 'devops', 'drag-drop'],
};

const ORDER = ['push', 'tests', 'docker', 'deploy'];
const ITEMS = [
  { id: 'push', label: 'Push' },
  { id: 'docker', label: 'Docker Build' },
  { id: 'tests', label: 'Tests' },
  { id: 'deploy', label: 'Deploy' },
];

export function init(container, engine) {
  container.innerHTML = `
    <h3>Fix My Deployment</h3>
    <p class="challenge-body">Arrange these steps in the correct CI/CD order.</p>
    <div class="pipeline-board" aria-label="Pipeline ordering challenge">
      <div class="pipeline-slots" aria-hidden="true">
        ${ORDER.map((id, idx) => `<div class="pipeline-slot" data-slot-index="${idx}" data-expected="${id}"></div>`).join('')}
      </div>
      <div class="pipeline-items">
        ${ITEMS.map((item) => `<div class="drag-item" draggable="true" data-item-id="${item.id}">${item.label}</div>`).join('')}
      </div>
    </div>
    <button id="pipeline-submit" class="btn btn-primary" type="button" style="margin-top:1rem;">Check Order</button>
    <p id="pipeline-feedback" class="sr-only" aria-live="polite"></p>
  `;

  const slots = container.querySelectorAll('.pipeline-slot');
  const items = container.querySelectorAll('.drag-item');
  const submitBtn = container.querySelector('#pipeline-submit');
  const feedback = container.querySelector('#pipeline-feedback');
  let score = 0;

  items.forEach((item) => {
    item.ondragstart = (e) => {
      e.dataTransfer.setData('text/plain', item.dataset.itemId);
      e.dataTransfer.effectAllowed = 'move';
    };
  });

  slots.forEach((slot) => {
    slot.ondragover = (e) => {
      e.preventDefault();
      slot.style.borderColor = 'var(--color-accent)';
    };
    slot.ondragleave = () => {
      slot.style.borderColor = '';
    };
    slot.ondrop = (e) => {
      e.preventDefault();
      slot.style.borderColor = '';
      const id = e.dataTransfer.getData('text/plain');
      slot.innerHTML = '';
      const existing = document.querySelector(`.pipeline-slot .drag-item[data-item-id="${id}"]`);
      if (existing) existing.remove();
      const moved = document.querySelector(`.drag-item[data-item-id="${id}"]`);
      if (moved) slot.appendChild(moved);
    };
  });

  if (submitBtn) {
    submitBtn.onclick = () => {
      let correct = 0;
      slots.forEach((slot, idx) => {
        const item = slot.querySelector('.drag-item');
        if (item && item.dataset.itemId === ORDER[idx]) correct += 1;
      });
      score = correct * 25;
      if (feedback) feedback.textContent = `You placed ${correct} of ${ORDER.length} steps correctly.`;
      if (engine && typeof engine.complete === 'function') {
        engine.complete('dragDrop', score);
      }
    };
  }
}

export function cleanup(container) {
  if (container) container.innerHTML = '';
}
