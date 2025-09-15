import { Engine } from './engine.js';
import { initView, render } from './view.js';
import { state } from './state.js';

const engine = new Engine();
// eksponuojama debug'ui konsolėje
if (typeof window !== 'undefined') {
  window.game = { state, engine };
}

function startGame() {
  engine.init();
  initView({
    onStart: () => engine.startRound(0),
    onSubmit: (answer) => {
      engine.submit(answer);
      engine.showResult();
    },
  });
  render();
}

// automatiškai inicijuoja žaidimą
document.addEventListener('DOMContentLoaded', () => {
  startGame();
});

// eksportuojama testams ar plėtimui
export { startGame, state, engine };
