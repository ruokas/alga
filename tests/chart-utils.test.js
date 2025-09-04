import { updateChart, createFlowChart, updateFlowChart } from '../chart-utils.js';

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

describe('createFlowChart', () => {
  test('returns null without canvas', () => {
    expect(createFlowChart(null)).toBeNull();
  });

  test('creates chart when Chart is available', () => {
    const ctx = {};
    const canvas = { getContext: jest.fn(() => ctx) };
    global.Chart = jest.fn(() => ({ data: { labels: [], datasets: [{ data: [] }] }, update: jest.fn() }));
    const chart = createFlowChart(canvas, '#000');
    expect(canvas.getContext).toHaveBeenCalledWith('2d');
    expect(global.Chart).toHaveBeenCalled();
    expect(chart).toBeTruthy();
    delete global.Chart;
  });
});

describe('updateFlowChart', () => {
  test('updates chart data and calls update', () => {
    const chart = { data: { labels: [], datasets: [{ data: [] }] }, update: jest.fn() };
    updateFlowChart(chart, [ { day: 1, total: 5 }, { day: 2, total: 10 } ]);
    expect(chart.data.labels).toEqual([1,2]);
    expect(chart.data.datasets[0].data).toEqual([5,10]);
    expect(chart.update).toHaveBeenCalled();
  });
});
