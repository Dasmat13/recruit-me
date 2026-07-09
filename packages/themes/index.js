export const themes = {
  terminal: {
    name: 'Terminal',
    font: "'JetBrains Mono', monospace",
    background: '#0D0D0D',
    foreground: '#00E87E',
    accent: '#FF9F43',
    border: 'none',
  },
  retro: {
    name: 'Retro Arcade',
    font: "'Space Grotesk', sans-serif",
    background: '#FFFFFF',
    foreground: '#000000',
    accent: '#FF3F3F',
    border: '3px solid #000',
  },
};

export function applyTheme(themeName) {
  const theme = themes[themeName] || themes.retro;
  const root = document.documentElement;
  root.style.setProperty('--font-main', theme.font);
  root.style.setProperty('--color-bg', theme.background);
  root.style.setProperty('--color-fg', theme.foreground);
  root.style.setProperty('--color-accent', theme.accent);
}
