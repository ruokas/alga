const { compute } = require('../compute');

describe('compute core logic', () => {
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
});
