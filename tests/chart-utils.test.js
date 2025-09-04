import { updateChart } from '../chart-utils.js';

describe('updateChart', () => {
  test('calls updater when chart is valid', () => {
    const chart = { update: jest.fn() };
    const updater = jest.fn(c => c.update());
    updateChart(chart, updater);
    expect(updater).toHaveBeenCalledWith(chart);
    expect(chart.update).toHaveBeenCalled();
  });

  test('skips update when chart is null', () => {
    const updater = jest.fn();
    updateChart(null, updater);
    expect(updater).not.toHaveBeenCalled();
  });

  test('skips update when update method missing', () => {
    const chart = {};
    const updater = jest.fn();
    updateChart(chart, updater);
    expect(updater).not.toHaveBeenCalled();
  });
});
