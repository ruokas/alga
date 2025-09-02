export function initThemeToggle() {
  const THEME_KEY = 'ED_THEME';
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light-theme');
  }
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.checked = document.documentElement.classList.contains('light-theme');
    toggle.addEventListener('change', () => {
      const isLight = toggle.checked;
      document.documentElement.classList.toggle('light-theme', isLight);
      localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
    });
  }
}

// Support CommonJS for tests
if (typeof module !== 'undefined') {
  module.exports = { initThemeToggle };
}
