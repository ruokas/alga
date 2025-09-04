const { computeBudget } = require('../budget');

describe('computeBudget', () => {
  test('calculates per-role and total budgets', () => {
    const result = computeBudget({
      counts: { doctor: 2, nurse: 3, assistant: 1 },
      rateInputs: {
        zoneCapacity: 100,
        patientCount: 0,
        maxCoefficient: 1.3,
        baseDoc: 10,
        baseNurse: 8,
        baseAssist: 6,
        shiftH: 12,
        monthH: 160,
        n1: 0,
        n2: 0,
        n3: 0,
        n4: 0,
        n5: 0,
      },
    });

    expect(result.shift_budget.doctor).toBeCloseTo(240);
    expect(result.shift_budget.nurse).toBeCloseTo(288);
    expect(result.shift_budget.assistant).toBeCloseTo(72);
    expect(result.shift_budget.total).toBeCloseTo(600);
    expect(result.month_budget.total).toBeCloseTo(8000);
  });

  test('handles invalid counts', () => {
    const result = computeBudget({
      counts: { doctor: NaN, nurse: -1, assistant: 1 },
      rateInputs: {
        zoneCapacity: 100,
        patientCount: 0,
        maxCoefficient: 1.3,
        baseDoc: 10,
        baseNurse: 8,
        baseAssist: 6,
        shiftH: 12,
        monthH: 160,
        n1: 0,
        n2: 0,
        n3: 0,
        n4: 0,
        n5: 0,
      },
    });

    expect(result.shift_budget.doctor).toBe(0);
    expect(result.shift_budget.nurse).toBe(0);
    expect(result.shift_budget.assistant).toBeCloseTo(72);
    expect(result.shift_budget.total).toBeCloseTo(72);
  });
});
