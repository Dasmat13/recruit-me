export function fadeIn(el, duration = 300) {
  el.style.opacity = '0';
  el.style.transition = `opacity ${duration}ms ease`;
  requestAnimationFrame(() => {
    el.style.opacity = '1';
  });
}

export function slideUp(el, duration = 300) {
  el.style.transform = 'translateY(20px)';
  el.style.opacity = '0';
  el.style.transition = `all ${duration}ms ease`;
  requestAnimationFrame(() => {
    el.style.transform = 'translateY(0)';
    el.style.opacity = '1';
  });
}
