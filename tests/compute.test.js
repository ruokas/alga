const { compute } = require('../compute');

describe('compute core logic', () => {
  test('low occupancy yields no V bonus', () => {
    const result = compute({
      zoneCapacity: 100,
      patientCount: 50,
      maxCoefficient: 1.3,
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
      zoneCapacity: 80,
      patientCount: 100,
      maxCoefficient: 1.3,
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

  test('falls back to ESI counts when patientCount is zero', () => {
    const result = compute({
      zoneCapacity: 80,
      patientCount: 0,
      maxCoefficient: 1.3,
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
    expect(result.patientCount).toBe(100);
    expect(result.V_bonus).toBeGreaterThan(0);
    expect(result.A_bonus).toBeGreaterThan(0);
    expect(result.K_zona).toBeGreaterThan(1);
  });

  test('bonuses capped by kMax', () => {
    const result = compute({
      zoneCapacity: 80,
      patientCount: 120,
      maxCoefficient: 1.3,
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

  test('returns baseline salaries without bonuses', () => {
    const result = compute({
      zoneCapacity: 100,
      patientCount: 100,
      maxCoefficient: 1.5,
      baseDoc: 10,
      baseNurse: 8,
      baseAssist: 6,
      shiftH: 12,
      monthH: 160,
      n1: 20,
      n2: 20,
      n3: 60,
      n4: 0,
      n5: 0,
    });
    expect(result.baseline_shift_salary.doctor).toBeCloseTo(120);
    expect(result.baseline_month_salary.nurse).toBeCloseTo(1280);
    expect(result.shift_salary.doctor).toBeGreaterThan(result.baseline_shift_salary.doctor);
  });

  test('handles NaN inputs with safe defaults', () => {
    const result = compute({
      zoneCapacity: NaN,
      patientCount: NaN,
      maxCoefficient: NaN,
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
    expect(result.patientCount).toBe(0);
    expect(result.K_zona).toBe(0);
    expect(result.shift_salary.doctor).toBe(0);
    expect(result.month_salary.doctor).toBe(0);
  });

  test('clamps negative values to zero', () => {
    const result = compute({
      zoneCapacity: -100,
      patientCount: -50,
      maxCoefficient: -1,
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
    expect(result.patientCount).toBe(0);
    expect(result.ratio).toBe(0);
    expect(result.shift_hours).toBe(0);
    expect(result.month_hours).toBe(0);
  });

  test('ignores infinite values', () => {
    const result = compute({
      zoneCapacity: Infinity,
      patientCount: Infinity,
      maxCoefficient: Infinity,
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
    expect(result.patientCount).toBe(0);
    expect(result.K_zona).toBe(0);
    expect(result.shift_salary.doctor).toBe(0);
    expect(result.month_salary.doctor).toBe(0);
  });

  test('handles extra rate roles', () => {
    const result = compute({
      zoneCapacity: 10,
      patientCount: 10,
      maxCoefficient: 2,
      baseDoc: 0,
      baseNurse: 0,
      baseAssist: 0,
      extraRates: { tech: 5 },
      shiftH: 1,
      monthH: 10,
      n1: 0,
      n2: 0,
      n3: 0,
      n4: 0,
      n5: 0,
    });
    expect(result.final_rates.tech).toBeCloseTo(5 * result.K_zona);
    expect(result.shift_salary.tech).toBeCloseTo(result.final_rates.tech * 1);
  });

  test('supports custom bonus thresholds', () => {
    const custom = {
      V_BONUS: [
        { limit: 1, value: 0 },
        { limit: Infinity, value: 0.2 },
      ],
      A_BONUS: [
        { limit: 0.2, value: 0 },
        { limit: Infinity, value: 0.3 },
      ],
    };
    const result = compute({
      zoneCapacity: 100,
      patientCount: 150,
      maxCoefficient: 2,
      baseDoc: 10,
      baseNurse: 10,
      baseAssist: 10,
      shiftH: 0,
      monthH: 0,
      n1: 30,
      n2: 30,
      n3: 90,
      n4: 0,
      n5: 0,
    }, custom);
    expect(result.V_bonus).toBe(0.2);
    expect(result.A_bonus).toBe(0.3);
    expect(result.K_zona).toBeCloseTo(1.5);
  });
});
