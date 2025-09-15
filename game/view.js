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
    showStart();
  });

  submitBtn?.addEventListener('click', () => {
    onSubmit(answerInput?.value || '');
  });
}

/** Rodo pradžios pranešimą */
export function showStart() {
  const result = document.getElementById('result');
  if (result) {
    result.textContent = 'Per 60 s pasiek K_zona ≥ 1.1 su mažiausiais tarifais';
  }
}

/**
 * Atvaizduoja rezultatą ir siūlo kitą raundą
 * @param {{K_zona:number,cost:number,score:number,onNext:Function}} param0
 */
export function showResult({ K_zona, cost, score, onNext }) {
  const result = document.getElementById('result');
  if (result) {
    result.innerHTML = `K_zona: ${K_zona.toFixed(2)} | Sąnaudos: ${cost} | Taškai: ${score}`;
    const btn = document.createElement('button');
    btn.id = 'next';
    btn.textContent = 'Kitas raundas';
    btn.addEventListener('click', onNext);
    result.appendChild(document.createElement('br'));
    result.appendChild(btn);
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
