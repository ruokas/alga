import { Engine } from '../game/engine.js';

describe('Engine timer', () => {
  test('fires timeout after time limit', () => {
    jest.useFakeTimers();
    const onTimeout = jest.fn();
    const engine = new Engine({ onTimeout });
    engine.startRound(0);
    jest.advanceTimersByTime(60000);
    expect(onTimeout).toHaveBeenCalled();
    expect(engine.current).toBe('timeout');
    jest.useRealTimers();
  });
});
