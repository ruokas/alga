import { Engine } from '../game/engine.js';
import { state } from '../game/state.js';

describe('Engine state machine', () => {
  test('lifecycle', () => {
    const engine = new Engine();
    engine.init();
    expect(engine.current).toBe('init');

    engine.startRound(0);
    expect(engine.current).toBe('startRound');

    engine.submit(state.roundData.correct);
    expect(engine.current).toBe('submit');

    const result = engine.showResult();
    expect(engine.current).toBe('showResult');
    expect(result).toBe(1);
    expect(state.score).toBe(1);
  });
});
