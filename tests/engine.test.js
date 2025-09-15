import { DirectorGameEngine } from '../game/engine.js';
import { state } from '../game/state.js';
import { levels } from '../game/levels.js';

describe('DirectorGameEngine', () => {
  let canvas;
  let ctx;
  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 420;
    ctx = createMockContext();
    canvas.getContext = jest.fn(() => ctx);
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('start inicializuoja pasirinktą lygį', () => {
    const engine = new DirectorGameEngine(canvas);
    engine.start(2);
    expect(state.levelIndex).toBe(2);
    expect(state.timeLeft).toBe(levels[2].timeLimit);
    expect(state.running).toBe(true);
    expect(canvas.getContext).toHaveBeenCalledWith('2d');
  });

  test('pasibaigus laikui kviečia onEnd su reason="time"', () => {
    const onEnd = jest.fn();
    const engine = new DirectorGameEngine(canvas, { onEnd });
    engine.start(0);
    engine.update(levels[0].timeLimit + 0.1);
    expect(onEnd).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'time', levelIndex: 0 })
    );
    expect(state.running).toBe(false);
  });

  test('judant žiūrint direktoriui įtarimas pasiekia ribą ir žaidimas baigiasi', () => {
    const onEnd = jest.fn();
    const engine = new DirectorGameEngine(canvas, { onEnd });
    engine.start(0);
    engine.director.mode = 'looking';
    engine.director.timer = Number.POSITIVE_INFINITY;
    engine.keys.add('arrowright');
    const secondsNeeded = levels[0].suspicionMax / levels[0].suspicionIncrease;
    engine.update(secondsNeeded + 0.1);
    expect(onEnd).toHaveBeenCalledWith(expect.objectContaining({ reason: 'caught' }));
    expect(state.running).toBe(false);
  });
});

function createMockContext() {
  return {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    closePath: jest.fn(),
    fillText: jest.fn(),
    createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
    font: '',
    textAlign: 'left',
  };
}
