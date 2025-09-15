import { DirectorGameEngine } from './engine.js';
import { initView } from './view.js';
import { state } from './state.js';
import { levels } from './levels.js';

let engine;
let view;

function boot() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) {
    console.error('Nerastas žaidimo drobės elementas (#game-canvas)');
    return;
  }

  state.loadHighScores();

  engine = new DirectorGameEngine(canvas, {
    onUpdate: (payload) => view?.updateHUD(payload),
    onEnd: (payload) => {
      view?.showEnd(payload);
      view?.renderHighScores(state.highScores);
    },
  });

  view = initView({
    levels,
    onStart: (levelIndex) => {
      engine.start(levelIndex);
      view.updateLevelDescription(levelIndex);
      view.renderHighScores(state.highScores);
    },
    onRestart: (levelIndex) => {
      engine.start(levelIndex);
      view.updateLevelDescription(levelIndex);
      view.renderHighScores(state.highScores);
    },
    onClearScores: () => {
      state.clearHighScores();
    },
  });

  view.toggleRunningState(false);
  view.renderHighScores(state.highScores);
  view.updateHUD({
    score: 0,
    suspicion: 0,
    suspicionMax: levels[0].suspicionMax,
    timeLeft: levels[0].timeLimit,
    directorMode: 'distracted',
  });
}

document.addEventListener('DOMContentLoaded', boot);

if (typeof window !== 'undefined') {
  window.directorGame = {
    get state() {
      return state;
    },
    start(levelIndex = 0) {
      engine?.start(levelIndex);
    },
    levels,
  };
}

export { boot, state };
