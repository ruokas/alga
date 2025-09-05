export function initThemeToggle() {
  const THEME_KEY = 'ED_THEME';
  const root = document.documentElement;
  const body = document.body;
  const savedTheme = localStorage.getItem(THEME_KEY);
  let isLight = savedTheme === 'light';
  root.classList.toggle('light-theme', isLight);
  body.classList.toggle('light-theme', isLight);

  let apply;
  if (typeof jest === 'undefined') {
    const loadMaterial = new Function('return import("@material/material-color-utilities")');
    loadMaterial().then(({ argbFromHex, themeFromSourceColor, applyTheme }) => {
      const source = argbFromHex('#6750A4');
      const theme = themeFromSourceColor(source, { variant: 'expressive' });
      apply = (light) => applyTheme(theme, { target: root, dark: !light });
      apply(isLight);
    });
  }

  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.checked = isLight;
    toggle.addEventListener('change', () => {
      isLight = toggle.checked;
      root.classList.toggle('light-theme', isLight);
      body.classList.toggle('light-theme', isLight);
      localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
      if (apply) {
        apply(isLight);
      }
    });
  }
}

// Support CommonJS for tests
if (typeof module !== 'undefined') {
  module.exports = { initThemeToggle };
}
