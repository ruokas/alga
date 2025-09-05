import {
  updateChart,
  createFlowChart,
  updateFlowChart,
  createBudgetChart,
  updateBudgetChart,
  createDayNightChart,
  updateDayNightChart,
  createStaffChart,
  updateStaffChart,
} from '../chart-utils.js';

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

describe('createBudgetChart', () => {
  test('returns null without canvas', () => {
    expect(createBudgetChart(null)).toBeNull();
  });

  test('creates chart when Chart is available', () => {
    const ctx = {};
    const canvas = { getContext: jest.fn(() => ctx) };
    global.Chart = jest.fn(() => ({ data: { labels: [], datasets: [{ data: [] }] }, update: jest.fn() }));
    const chart = createBudgetChart(canvas, 'bar');
    expect(canvas.getContext).toHaveBeenCalledWith('2d');
    expect(global.Chart).toHaveBeenCalled();
    expect(chart).toBeTruthy();
    delete global.Chart;
  });
});

describe('updateBudgetChart', () => {
  test('updates chart data and calls update', () => {
    const chart = { data: { datasets: [{ data: [] }, { data: [] }] }, update: jest.fn() };
    updateBudgetChart(chart, { doctor: 10, nurse: 20, assistant: 30 }, { doctor: 1, nurse: 2, assistant: 3 });
    expect(chart.data.datasets[0].data).toEqual([10,20,30]);
    expect(chart.data.datasets[1].data).toEqual([1,2,3]);
    expect(chart.update).toHaveBeenCalled();
  });
});

describe('createDayNightChart', () => {
  test('returns null without canvas', () => {
    expect(createDayNightChart(null)).toBeNull();
  });

  test('creates chart when Chart is available', () => {
    const ctx = {};
    const canvas = { getContext: jest.fn(() => ctx) };
    global.Chart = jest.fn(() => ({ data: { labels: [], datasets: [{ data: [] }, { data: [] }] }, update: jest.fn() }));
    const chart = createDayNightChart(canvas);
    expect(canvas.getContext).toHaveBeenCalledWith('2d');
    expect(global.Chart).toHaveBeenCalled();
    expect(chart).toBeTruthy();
    delete global.Chart;
  });
});

describe('updateDayNightChart', () => {
  test('updates chart data and calls update', () => {
    const chart = { data: { datasets: [{ data: [] }, { data: [] }] }, update: jest.fn() };
    updateDayNightChart(chart, { doctor: 1, nurse: 2, assistant: 3 }, { doctor: 4, nurse: 5, assistant: 6 });
    expect(chart.data.datasets[0].data).toEqual([1,2,3]);
    expect(chart.data.datasets[1].data).toEqual([4,5,6]);
    expect(chart.update).toHaveBeenCalled();
  });
});

describe('createStaffChart', () => {
  test('returns null without canvas', () => {
    expect(createStaffChart(null)).toBeNull();
  });

  test('creates chart when Chart is available', () => {
    const ctx = {};
    const canvas = { getContext: jest.fn(() => ctx) };
    global.Chart = jest.fn(() => ({ data: { datasets: [{ data: [] }] }, update: jest.fn() }));
    const chart = createStaffChart(canvas);
    expect(canvas.getContext).toHaveBeenCalledWith('2d');
    expect(global.Chart).toHaveBeenCalled();
    expect(chart).toBeTruthy();
    delete global.Chart;
  });
});

describe('updateStaffChart', () => {
  test('aggregates day and night counts and updates chart', () => {
    const chart = { data: { datasets: [{ data: [] }] }, update: jest.fn() };
    const counts = {
      day: { doctor: 1, nurse: 2, assistant: 3 },
      night: { doctor: 4, nurse: 5, assistant: 6 },
    };
    updateStaffChart(chart, counts);
    expect(chart.data.datasets[0].data).toEqual([5,7,9]);
    expect(chart.update).toHaveBeenCalled();
  });
});
