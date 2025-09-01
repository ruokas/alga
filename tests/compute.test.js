const { compute } = require('../compute');

describe('compute core logic', () => {
  afterEach(() => { delete global.localStorage; });
  test('low occupancy yields no V bonus', () => {
    const result = compute({
      C: 100,
      N: 50,
      kMax: 1.3,
      baseDoc: 10,
      baseNurse: 10,
      baseAssist: 10,
      shiftH: 0,
      monthH: 0,
      n1: 10,
      n2: 5,
      n3: 35,
      n4: 0,
      n5: 0,
    });
    expect(result.V_bonus).toBe(0);
    expect(result.A_bonus).toBe(0.10);
    expect(result.K_zona).toBeCloseTo(1.10);
  });

  test('medium occupancy and acuity bonuses combine', () => {
    const result = compute({
      C: 80,
      N: 100,
      kMax: 1.3,
      baseDoc: 10,
      baseNurse: 10,
      baseAssist: 10,
      shiftH: 0,
      monthH: 0,
      n1: 10,
      n2: 20,
      n3: 70,
      n4: 0,
      n5: 0,
    });
    expect(result.V_bonus).toBe(0.10);
    expect(result.A_bonus).toBe(0.10);
    expect(result.K_zona).toBeCloseTo(1.20);
  });

  test('bonuses capped by kMax', () => {
    const result = compute({
      C: 80,
      N: 120,
      kMax: 1.3,
      baseDoc: 10,
      baseNurse: 10,
      baseAssist: 10,
      shiftH: 0,
      monthH: 0,
      n1: 20,
      n2: 20,
      n3: 80,
      n4: 0,
      n5: 0,
    });
    expect(result.V_bonus).toBe(0.15);
    expect(result.A_bonus).toBe(0.15);
    expect(result.K_zona).toBeCloseTo(1.30);
  });

  test('handles NaN inputs with safe defaults', () => {
    const result = compute({
      C: NaN,
      N: NaN,
      kMax: NaN,
      baseDoc: 10,
      baseNurse: 10,
      baseAssist: 10,
      shiftH: NaN,
      monthH: NaN,
      n1: NaN,
      n2: NaN,
      n3: NaN,
      n4: NaN,
      n5: NaN,
    });
    expect(result.N).toBe(0);
    expect(result.K_zona).toBe(0);
    expect(result.shift_salary.doctor).toBe(0);
    expect(result.month_salary.doctor).toBe(0);
  });

  test('clamps negative values to zero', () => {
    const result = compute({
      C: -100,
      N: -50,
      kMax: -1,
      baseDoc: 10,
      baseNurse: 10,
      baseAssist: 10,
      shiftH: -10,
      monthH: -160,
      n1: -5,
      n2: -5,
      n3: -5,
      n4: -5,
      n5: -5,
    });
    expect(result.N).toBe(0);
    expect(result.ratio).toBe(0);
    expect(result.shift_hours).toBe(0);
    expect(result.month_hours).toBe(0);
  });

  test('ignores infinite values', () => {
    const result = compute({
      C: Infinity,
      N: Infinity,
      kMax: Infinity,
      baseDoc: 10,
      baseNurse: 10,
      baseAssist: 10,
      shiftH: Infinity,
      monthH: Infinity,
      n1: Infinity,
      n2: Infinity,
      n3: Infinity,
      n4: Infinity,
      n5: Infinity,
    });
    expect(result.N).toBe(0);
    expect(result.K_zona).toBe(0);
    expect(result.shift_salary.doctor).toBe(0);
    expect(result.month_salary.doctor).toBe(0);
  });

  test('uses thresholds from localStorage', () => {
    const custom = {
      V_BONUS: [
        { limit: 1, value: 0 },
        { limit: 2, value: 0.5 },
        { limit: 3, value: 0.75 },
        { limit: Infinity, value: 1 },
      ],
      A_BONUS: [
        { limit: 0.1, value: 0 },
        { limit: 0.5, value: 0.2 },
        { limit: 0.9, value: 0.3 },
        { limit: Infinity, value: 0.4 },
      ],
    };
    global.localStorage = {
      getItem: () => JSON.stringify(custom),
      setItem: () => {},
    };
    const result = compute({
      C: 100,
      N: 150,
      kMax: 2,
      baseDoc: 10,
      baseNurse: 10,
      baseAssist: 10,
      shiftH: 0,
      monthH: 0,
      n1: 20,
      n2: 5,
      n3: 125,
      n4: 0,
      n5: 0,
    });
    expect(result.V_bonus).toBe(0.5);
    expect(result.A_bonus).toBe(0.2);
    expect(result.K_zona).toBeCloseTo(1.7);
  });
});
