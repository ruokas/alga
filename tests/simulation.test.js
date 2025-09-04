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
    expect(res.days).toHaveLength(5);
  });

  test('follows real daily patient counts pattern', () => {
    const res = simulatePeriod(7, 0);
    const totals = res.days.map(r => r.total);
    expect(totals).toEqual([135, 126, 124, 122, 130, 117, 119]);
  });

  test('uses custom patientCounts and startIndex', () => {
    const res = simulatePeriod(4, 0, { patientCounts: [10, 20], startIndex: 1 });
    const totals = res.days.map(r => r.total);
    expect(totals).toEqual([20, 10, 20, 10]);
  });

  test('applies variation within expected bounds', () => {
    const res = simulatePeriod(5, 0, { patientCounts: [100], variation: 0.1 });
    res.days.forEach(r => {
      expect(r.total).toBeGreaterThanOrEqual(90);
      expect(r.total).toBeLessThan(110);
    });
  });

  test('aggregates summary totals correctly', () => {
    const res = simulatePeriod(2, 0, { patientCounts: [10], variation: 0 });
    const sumTotals = res.days.reduce((acc, d) => acc + d.total, 0);
    const sumCounts = res.days.reduce((acc, d) => acc.map((v, i) => v + d.counts[i]), [0,0,0,0,0]);
    expect(res.summary.totalPatients).toBe(sumTotals);
    expect(res.summary.esiTotals).toEqual(sumCounts);
  });
});
