import { initView } from '../game/view.js';
import { state } from '../game/state.js';
import { levels } from '../game/levels.js';

function mountDom() {
  document.body.innerHTML = `
    <div>
      <h1 id="game-title"></h1>
      <p id="game-subtitle"></p>
      <span id="funds-label"></span>
      <span id="timer-label"></span>
      <span id="suspicion-label"></span>
      <span id="level-label"></span>
      <h2 id="highscores-title"></h2>
      <h2 id="instructions-title"></h2>
      <p id="local-note"></p>
      <p id="shortcuts"></p>
      <p id="status"></p>
      <button id="start"></button>
      <button id="restart"></button>
      <button id="overlay-action"></button>
      <button id="clear-scores"></button>
      <select id="level"></select>
      <p id="level-description"></p>
      <div id="funds"></div>
      <div id="timer"></div>
      <div id="suspicion-bar"></div>
      <div id="overlay"></div>
      <div id="overlay-message"></div>
      <ol id="instructions"></ol>
      <ol id="highscores"></ol>
    </div>
  `;
}

describe('view helpers', () => {
  beforeEach(() => {
    mountDom();
  });

  test('renderHighScores rodo top 5 reikšmes', () => {
    const view = initView({
      levels,
      onStart: jest.fn(),
      onRestart: jest.fn(),
      onClearScores: jest.fn(),
    });
    state.highScores = [5000, 4200, 3000, 1500, 900, 100];
    view.renderHighScores(state.highScores);
    const items = Array.from(document.querySelectorAll('#highscores li'));
    expect(items).toHaveLength(5);
    expect(items[0].textContent).toContain('€');
  });

  test('updateHUD atnaujina rodmenis', () => {
    const view = initView({
      levels,
      onStart: jest.fn(),
      onRestart: jest.fn(),
      onClearScores: jest.fn(),
    });
    view.updateHUD({
      score: 1200,
      suspicion: 50,
      suspicionMax: 100,
      timeLeft: 42,
      directorMode: 'looking',
    });
    expect(document.getElementById('funds').textContent).toContain('€');
    expect(document.getElementById('timer').textContent).toBeDefined();
    expect(document.getElementById('suspicion-bar').style.width).toBe('50%');
    expect(document.getElementById('status').dataset.mode).toBe('looking');

    view.updateHUD({
      score: 1400,
      suspicion: 10,
      suspicionMax: 100,
      timeLeft: 35,
      directorMode: 'distracted',
    });
    expect(document.getElementById('status').dataset.mode).toBe('distracted');
  });
});
