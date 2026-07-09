/**
 * Reusable animation presets for Recruit Me experiences.
 *
 * These helpers are intentionally small and dependency-free.
 */

export function fadeIn(el, duration = 320) {
  if (!el) return;
  el.style.opacity = '0';
  el.style.transition = `opacity ${duration}ms ease`;
  requestAnimationFrame(() => {
    el.style.opacity = '1';
  });
}

export function slideUp(el, duration = 320) {
  if (!el) return;
  el.style.transform = 'translateY(16px)';
  el.style.opacity = '0';
  el.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;
  requestAnimationFrame(() => {
    el.style.transform = 'translateY(0)';
    el.style.opacity = '1';
  });
}

export function pulse(el, duration = 360) {
  if (!el) return;
  const keyframes = [
    { transform: 'scale(1)', opacity: 1 },
    { transform: 'scale(1.06)', opacity: 0.95 },
    { transform: 'scale(1)', opacity: 1 },
  ];
  const anim = el.animate(keyframes, { duration, easing: 'ease-in-out' });
  anim.addEventListener('finish', () => anim.cancel());
}

export function confetti(canvasEl) {
  if (!canvasEl) return;
  const ctx = canvasEl.getContext('2d');
  if (!ctx) return;

  const particles = Array.from({ length: 80 }, () => ({
    x: Math.random() * (canvasEl.width || 400),
    y: Math.random() * -((canvasEl.height || 300) / 2),
    size: Math.random() * 6 + 3,
    speed: Math.random() * 2 + 1.5,
    swing: Math.random() * 2 - 1,
    hue: Math.floor(Math.random() * 360),
  }));

  let frame = 0;
  const maxFrames = 140;

  function draw() {
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    particles.forEach((p) => {
      p.y += p.speed;
      p.x += Math.sin((frame + p.y) * 0.02) * p.swing;
      ctx.fillStyle = `hsl(${p.hue}, 80%, 60%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    frame += 1;
    if (frame < maxFrames) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  }

  draw();
}
