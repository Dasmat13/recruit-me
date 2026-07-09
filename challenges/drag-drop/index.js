/**
 * Drag & Drop Challenge
 *
 * Simple matching challenge: items → buckets.
 */

export function init(container) {
  const items = [
    { id: 'docker', label: 'Docker' },
    { id: 'gh-actions', label: 'GitHub Actions' },
    { id: 'terraform', label: 'Terraform' },
    { id: 'prometheus', label: 'Prometheus' },
  ];
  const buckets = [
    { id: 'containerization', label: 'Containerization' },
    { id: 'cicd', label: 'CI/CD' },
    { id: 'iac', label: 'Infrastructure as Code' },
    { id: 'monitoring', label: 'Monitoring' },
  ];
  const answers = {
    docker: 'containerization',
    'gh-actions': 'cicd',
    terraform: 'iac',
    prometheus: 'monitoring',
  };

  container.innerHTML = '<h3>Drag each item into the correct bucket.</h3>';

  const board = document.createElement('div');
  board.style.display = 'grid';
  board.style.gridTemplateColumns = '1fr 1fr';
  board.style.gap = '1rem';
  container.appendChild(board);

  const left = document.createElement('div');
  left.className = 'challenge-column';
  left.innerHTML = '<h4>Items</h4>';
  const right = document.createElement('div');
  right.className = 'challenge-column';
  right.innerHTML = '<h4>Buckets</h4>';

  board.appendChild(left);
  board.appendChild(right);

  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'draggable';
    el.textContent = item.label;
    el.draggable = true;
    el.dataset.id = item.id;
    left.appendChild(el);
  });

  buckets.forEach(b => {
    const zone = document.createElement('div');
    zone.className = 'drop-zone';
    zone.dataset.id = b.id;
    zone.textContent = b.label;
    zone.style.border = '2px dashed #000';
    zone.style.padding = '0.5rem';
    zone.style.borderRadius = '8px';
    zone.style.marginTop = '0.5rem';

    zone.ondragover = (e) => {
      e.preventDefault();
      zone.style.background = '#f4f4f4';
    };
    zone.ondragleave = () => {
      zone.style.background = '';
    };
    zone.ondrop = (e) => {
      e.preventDefault();
      zone.style.background = '';
      const id = e.dataTransfer.getData('text/plain');
      if (answers[id] === zone.dataset.id) {
        zone.style.background = '#d4edda';
        zone.textContent = `${b.label} ✓`;
      } else {
        zone.style.background = '#f8d7da';
        zone.textContent = `${b.label} ✗ Try again`;
      }
    };
    right.appendChild(zone);
  });

  document.querySelectorAll('.draggable').forEach(el => {
    el.ondragstart = (e) => {
      e.dataTransfer.setData('text/plain', el.dataset.id);
    };
  });
}
