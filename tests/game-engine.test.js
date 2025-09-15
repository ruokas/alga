import { Engine } from '../game/engine.js';
import { state, GAME_HIGHSCORES } from '../game/state.js';

describe('Engine state machine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('lifecycle and scoring', () => {
    const engine = new Engine();
    engine.init();
    expect(engine.current).toBe('init');

    engine.startRound(0);
    expect(engine.current).toBe('startRound');

    // fiksuojame 3 s vėlavimą
    state.startTime = Date.now() - 3000;
    engine.submit(state.roundData.correct);
    expect(engine.current).toBe('submit');

    const result = engine.showResult();
    expect(engine.current).toBe('showResult');
    expect(result).toBe(7);
    expect(state.score).toBe(7);
    const stored = JSON.parse(localStorage.getItem(GAME_HIGHSCORES));
    expect(stored[0]).toBe(7);
  });
});
