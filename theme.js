export function initThemeToggle() {
  const THEME_KEY = 'ED_THEME';
  const root = document.documentElement;
  const body = document.body;
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'light') {
    root.classList.add('light-theme');
    body.classList.add('light-theme');
  }
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.checked = root.classList.contains('light-theme');
    toggle.addEventListener('change', () => {
      const isLight = toggle.checked;
      root.classList.toggle('light-theme', isLight);
      body.classList.toggle('light-theme', isLight);
      localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
    });
  }
}

// Support CommonJS for tests
if (typeof module !== 'undefined') {
  module.exports = { initThemeToggle };
}
