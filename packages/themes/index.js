/**
 * Theme tokens and runtime switcher.
 *
 * Themes are pure JS token maps; the caller can render them as CSS
 * custom properties, inline styles, or class toggles.
 */

export const themes = {
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    font: "'JetBrains Mono', monospace",
    background: '#0D0D0D',
    foreground: '#00E87E',
    accent: '#FF9F43',
    surface: '#111111',
    muted: '#7a7a7a',
    border: '#1f1f1f',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    font: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    background: '#ffffff',
    foreground: '#111111',
    accent: '#2563eb',
    surface: '#f8fafc',
    muted: '#64748b',
    border: '#e2e8f0',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    font: "'Space Grotesk', 'Courier New', sans-serif",
    background: '#0b0f19',
    foreground: '#ff2ef9',
    accent: '#00f0ff',
    surface: '#101726',
    muted: '#8aa3c9',
    border: '#1f2b45',
  },
  neuroblast: {
    id: 'neuroblast',
    name: 'Neuroblast',
    font: "'Space Grotesk', system-ui, sans-serif",
    background: '#050A15',
    foreground: '#00F2FE',
    accent: '#FE0979',
    surface: '#0D162B',
    muted: '#5E6D8C',
    border: '#1A2B50',
  },
};

export function applyTheme(themeName) {
  const theme = themes[themeName] || themes.minimal;
  const root = document.documentElement;
  root.dataset.theme = theme.id;
  root.style.setProperty('--font-main', theme.font);
  root.style.setProperty('--color-bg', theme.background);
  root.style.setProperty('--color-fg', theme.foreground);
  root.style.setProperty('--color-accent', theme.accent);
  root.style.setProperty('--color-surface', theme.surface);
  root.style.setProperty('--color-muted', theme.muted);
  root.style.setProperty('--color-border', theme.border);
}

export function getToken(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim() || null;
}

export function listThemeIds() {
  return Object.keys(themes);
}
