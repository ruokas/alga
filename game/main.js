import { Engine } from './engine.js';
import { initView } from './view.js';
import { state } from './state.js';

const engine = new Engine();

function startGame() {
  engine.init();
  initView({
    onStart: () => engine.startRound({ correct: '42' }),
    onSubmit: (answer) => {
      engine.submit(answer);
      engine.showResult();
    },
  });
}

// automatiškai inicijuoja žaidimą
document.addEventListener('DOMContentLoaded', () => {
  startGame();
});

// eksportuojama testams ar plėtimui
export { startGame, state, engine };
