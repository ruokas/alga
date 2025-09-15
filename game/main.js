import { Engine } from './engine.js';
import { initView, showResult, renderHighScores } from './view.js';
import { state } from './state.js';

const engine = new Engine({
  onTimeout: handleResult,
});
// eksponuojama debug'ui konsolėje
if (typeof window !== 'undefined') {
  window.game = { state, engine };
}

function calculateOutcome() {
  const data = state.roundData;
  if (!data) return { K_zona: 0, cost: 0 };
  const K_zona = data.config.capacity
    ? data.esi.total / data.config.capacity
    : 0;
  const cost = data.esi.total;
  return { K_zona, cost };
}

function handleResult() {
  engine.showResult();
  const { K_zona, cost } = calculateOutcome();
  showResult({
    K_zona,
    cost,
    score: state.score,
    onNext: () => engine.startRound(0),
  });
}

function startGame() {
  engine.init();
  initView({
    onStart: () => engine.startRound(0),
    onSubmit: (answer) => {
      engine.submit(answer);
      handleResult();
    },
  });
  renderHighScores();
}

// automatiškai inicijuoja žaidimą
document.addEventListener('DOMContentLoaded', () => {
  startGame();
});

// eksportuojama testams ar plėtimui
export { startGame, state, engine };
