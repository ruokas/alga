import { state } from './state.js';

/**
 * Atvaizduoja būseną ir valdo įvykius
 */
export function initView({ onStart, onSubmit }) {
  const startBtn = document.getElementById('start');
  const submitBtn = document.getElementById('submit');
  const answerInput = document.getElementById('answer');

  startBtn?.addEventListener('click', () => {
    onStart();
    render();
  });

  submitBtn?.addEventListener('click', () => {
    onSubmit(answerInput?.value || '');
    render();
  });
}

/** Atvaizduoja rezultatą ekrane */
export function render() {
  const result = document.getElementById('result');
  if (result) {
    result.textContent = `Taškai: ${state.score}`;
  }
  renderHighScores();
}

/** Rodo top 5 rezultatų sąrašą */
export function renderHighScores() {
  const list = document.getElementById('highscores');
  if (!list) return;
  list.innerHTML = '';
  state.highScores.slice(0, 5).forEach((score, i) => {
    const li = document.createElement('li');
    li.textContent = `${i + 1}. ${score}`;
    list.appendChild(li);
  });
}
