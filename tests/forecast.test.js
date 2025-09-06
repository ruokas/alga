const { trainPatientModel, predictCounts } = require('../src/forecast.js');

describe('forecast model', () => {
  test('training computes model structure', () => {
    const data = [
      { total: 100, counts: [5, 15, 40, 30, 10] },
      { total: 120, counts: [6, 18, 48, 36, 12] }
    ];
    const model = trainPatientModel(data);
    expect(typeof model.total).toBe('number');
    expect(model.esiProbs).toHaveLength(5);
  });

  test('prediction returns expected shapes', () => {
    const res = predictCounts(3, 150);
    expect(res.days).toHaveLength(3);
    res.days.forEach(d => {
      expect(typeof d.total).toBe('number');
      expect(d.counts).toHaveLength(5);
    });
    expect(res.summary.totalPatients).toBeGreaterThan(0);
    expect(res.summary.esiTotals).toHaveLength(5);
  });
});
