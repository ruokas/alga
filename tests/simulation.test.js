const { simulateEsiCounts, simulatePeriod } = require('../simulation');

describe('simulateEsiCounts', () => {
  test('generates patient count between 10 and 30 when none provided', () => {
    const { total, counts } = simulateEsiCounts(0, 0);
    expect(total).toBeGreaterThanOrEqual(10);
    expect(total).toBeLessThanOrEqual(30);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(total);
  });

  test('respects specified patient count', () => {
    const { total, counts } = simulateEsiCounts(15, 100);
    expect(total).toBe(15);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(15);
  });
});

describe('simulatePeriod', () => {
  test('returns array with given number of days', () => {
    const res = simulatePeriod(5, 0);
    expect(res).toHaveLength(5);
  });
  
  test('follows real daily patient counts pattern', () => {
    const res = simulatePeriod(7, 0);
    const totals = res.map(r => r.total);
    expect(totals).toEqual([135, 126, 124, 122, 130, 117, 119]);
  });
});
