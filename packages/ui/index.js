/**
 * Shared UI primitives for Recruit Me challenge frontends.
 *
 * All helpers operate on the DOM only and avoid side effects outside
 * the provided container when possible.
 */

export function createCard(title, bodyHTML = '') {
  const card = document.createElement('div');
  card.className = 'challenge-card';
  card.setAttribute('role', 'region');
  card.setAttribute('aria-labelledby', 'challenge-title');
  card.innerHTML = `<h3 id="challenge-title">${escapeHtml(title)}</h3><div class="challenge-body">${bodyHTML}</div>`;
  return card;
}

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('leaving');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

export function renderList(items, template) {
  const container = document.createElement('div');
  container.className = 'challenge-list';
  items.forEach((item) => {
    const el = document.createElement('div');
    el.className = 'challenge-list-item';
    el.innerHTML = typeof template === 'function' ? escapeHtml(template(item)) : escapeHtml(template);
    container.appendChild(el);
  });
  return container;
}

export function focusFirstInteractive(container) {
  const focusable = container.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable && typeof focusable.focus === 'function') {
    focusable.focus();
  }
}

export function withErrorBoundary(container, label, fallback) {
  try {
    return fallback();
  } catch (err) {
    console.error(`[ui][${label}]`, err);
    if (container) {
      container.innerHTML = `
        <div class="challenge-card" role="alert">
          <h3>Something went wrong</h3>
          <p>${escapeHtml(err.message || 'Unknown error')}</p>
        </div>`;
    }
    return null;
  }
}

export function escapeHtml(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
