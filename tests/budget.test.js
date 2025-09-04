const { computeBudget } = require('../budget');
const { rowsToCsv } = require('../csv');
const { generatePdf } = require('../pdf');

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

describe('CSV and PDF generation', () => {
  const rateInputs = {
    zoneCapacity: 10,
    patientCount: 0,
    maxCoefficient: 1.2,
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
  };

  test('exports totals to csv', () => {
    const result = computeBudget({
      counts: { doctor: 1, nurse: 1, assistant: 1 },
      rateInputs,
    });
    const rows = [
      ['shift_total', result.shift_budget.total],
      ['month_total', result.month_budget.total],
    ];
    const csv = rowsToCsv(rows);
    const [headers, values] = csv.split('\n');
    expect(headers).toBe('shift_total,month_total');
    expect(values).toBe(`"${result.shift_budget.total}","${result.month_budget.total}"`);
  });

  test('generates pdf from budget data', () => {
    const result = computeBudget({
      counts: { doctor: 1, nurse: 1, assistant: 1 },
      rateInputs,
    });
    const doc = generatePdf({
      date: '2024-01-01',
      shift: 'D',
      zone: 'A',
      zone_label: 'Zone A',
      zoneCapacity: rateInputs.zoneCapacity,
      ...result,
    });
    expect(doc).toBeDefined();
    expect(typeof doc.save).toBe('function');
  });
});

describe('budget chart DOM integration', () => {
  let compute;
  let chartInstance;

  beforeEach(() => {
    document.body.innerHTML = `
      <input id="shiftHours" value="12" />
      <input id="monthHours" value="160" />
      <input id="baseRateDoc" value="10" />
      <input id="baseRateNurse" value="8" />
      <input id="baseRateAssist" value="6" />
      <input id="countDocDay" value="1" />
      <input id="countDocNight" value="1" />
      <input id="countNurseDay" value="1" />
      <input id="countNurseNight" value="1" />
      <input id="countAssistDay" value="1" />
      <input id="countAssistNight" value="1" />
      <span id="countDocDayCell"></span>
      <span id="countDocNightCell"></span>
      <span id="countNurseDayCell"></span>
      <span id="countNurseNightCell"></span>
      <span id="countAssistDayCell"></span>
      <span id="countAssistNightCell"></span>
      <span id="rateDocCell"></span>
      <span id="rateNurseCell"></span>
      <span id="rateAssistCell"></span>
      <span id="shiftDocCell"></span>
      <span id="shiftNurseCell"></span>
      <span id="shiftAssistCell"></span>
      <span id="monthDocCell"></span>
      <span id="monthNurseCell"></span>
      <span id="monthAssistCell"></span>
      <span id="shiftTotalCell"></span>
      <span id="monthTotalCell"></span>
      <canvas id="budgetChart"></canvas>
    `;

    const canvas = document.getElementById('budgetChart');
    canvas.getContext = jest.fn(() => ({}));
    chartInstance = { data: { datasets: [{ data: [] }] }, update: jest.fn() };
    global.Chart = jest.fn(() => chartInstance);

    jest.isolateModules(() => {
      ({ compute } = require('../budget-ui.js'));
    });
  });

  afterEach(() => {
    delete global.Chart;
    jest.resetModules();
  });

  test('renders and updates chart when counts change', () => {
    const rateInputs = {
      zoneCapacity: 1,
      patientCount: 0,
      maxCoefficient: 1,
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
    };
    const initial = computeBudget({ counts: { doctor: 2, nurse: 2, assistant: 2 }, rateInputs }).month_budget;
    expect(global.Chart).toHaveBeenCalledTimes(1);
    expect(chartInstance.data.datasets[0].data).toEqual([
      initial.doctor,
      initial.nurse,
      initial.assistant,
    ]);

    chartInstance.update.mockClear();
    document.getElementById('countDocDay').value = '2';
    compute();
    const updated = computeBudget({ counts: { doctor: 3, nurse: 2, assistant: 2 }, rateInputs }).month_budget;
    expect(chartInstance.data.datasets[0].data).toEqual([
      updated.doctor,
      updated.nurse,
      updated.assistant,
    ]);
    expect(chartInstance.update).toHaveBeenCalled();
  });
});
