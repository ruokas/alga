import { Engine } from '../game/engine.js';
import { state } from '../game/state.js';
import { levels } from '../game/levels.js';
import { simulateEsiCounts } from '../simulation.js';

jest.mock('../simulation.js', () => ({
  simulateEsiCounts: jest.fn(() => ({ total: 5, counts: [1,1,1,1,1] })),
}));

describe('engine.startRound', () => {
  beforeEach(() => {
    state.roundData = null;
  });

  test('pasirenka lygio konfigūraciją ir kviečia simulateEsiCounts', () => {
    const engine = new Engine();
    engine.startRound(1);
    expect(simulateEsiCounts).toHaveBeenCalledWith(levels[1].kMax, levels[1].capacity);
    expect(state.roundData.config).toEqual(levels[1]);
    expect(state.roundData.esi.total).toBe(5);
  });
});
