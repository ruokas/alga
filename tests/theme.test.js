const { initThemeToggle } = require('../theme.js');

beforeEach(() => {
  document.documentElement.className = '';
  document.body.className = '';
  document.body.innerHTML = '';
  localStorage.clear();
  delete window.matchMedia;
});

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

test('applies light theme when OS prefers light and no saved theme', () => {
  window.matchMedia = jest.fn().mockReturnValue({ matches: true });
  initThemeToggle();
  expect(document.documentElement.classList.contains('light-theme')).toBe(true);
  expect(document.body.classList.contains('light-theme')).toBe(true);
});

test('keeps dark theme when OS prefers dark and no saved theme', () => {
  window.matchMedia = jest.fn().mockReturnValue({ matches: false });
  initThemeToggle();
  expect(document.documentElement.classList.contains('light-theme')).toBe(false);
  expect(document.body.classList.contains('light-theme')).toBe(false);
});
