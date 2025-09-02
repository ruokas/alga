const { initThemeToggle } = require('../theme.js');

test('initThemeToggle toggles theme', () => {
  document.body.innerHTML = '<input id="themeToggle" type="checkbox" />';
  localStorage.setItem('ED_THEME', 'light');
  initThemeToggle();
  const toggle = document.getElementById('themeToggle');
  expect(document.documentElement.classList.contains('light-theme')).toBe(true);
  toggle.checked = false;
  toggle.dispatchEvent(new Event('change'));
  expect(document.documentElement.classList.contains('light-theme')).toBe(false);
  expect(localStorage.getItem('ED_THEME')).toBe('dark');
});
