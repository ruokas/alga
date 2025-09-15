import { DirectorGameEngine } from '../game/engine.js';
import { levels } from '../game/levels.js';

describe('DirectorGameEngine timer', () => {
  let canvas;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 420;
    canvas.getContext = jest.fn(() => createMockContext());
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('onUpdate kviečiamas su sumažintu laiku', () => {
    const onUpdate = jest.fn();
    const engine = new DirectorGameEngine(canvas, { onUpdate });
    engine.start(1);
    engine.update(1);
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        timeLeft: expect.closeTo(levels[1].timeLimit - 1, 5e-3),
        directorMode: expect.any(String),
      })
    );
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
