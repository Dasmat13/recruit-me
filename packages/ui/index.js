export function createCard(title, bodyHTML) {
  const card = document.createElement('div');
  card.className = 'challenge-card';
  card.innerHTML = `<h3>${title}</h3><div class="challenge-body">${bodyHTML}</div>`;
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
    toast.style.animation = 'toastIn 0.3s reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
