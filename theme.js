export function initThemeToggle() {
  const THEME_KEY = 'ED_THEME';
  const root = document.documentElement;
  const body = document.body;

  let isLight = root.classList.contains('light-theme');
  if (!isLight) {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light') {
      root.classList.add('light-theme');
      isLight = true;
    }
  }
  body.classList.toggle('light-theme', isLight);

  // Preload color utilities without blocking init
  import('@material/material-color-utilities').catch(() => {});

  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.checked = isLight;
    toggle.addEventListener('change', () => {
      const isLightNow = toggle.checked;
      root.classList.toggle('light-theme', isLightNow);
      body.classList.toggle('light-theme', isLightNow);
      localStorage.setItem(THEME_KEY, isLightNow ? 'light' : 'dark');
      import('@material/material-color-utilities').catch(() => {});
    });
  }
}

// Support CommonJS for tests
if (typeof module !== 'undefined') {
  module.exports = { initThemeToggle };
}
