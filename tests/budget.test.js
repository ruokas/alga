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

    expect(result.shift_budget_day.doctor).toBeCloseTo(240);
    expect(result.shift_budget_day.nurse).toBeCloseTo(288);
    expect(result.shift_budget_day.assistant).toBeCloseTo(72);
    expect(result.shift_budget_night.total).toBeCloseTo(0);
    expect(result.shift_budget.total).toBeCloseTo(600);
    expect(result.month_budget_day.total).toBeCloseTo(8000);
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

    expect(result.shift_budget_day.doctor).toBe(0);
    expect(result.shift_budget_day.nurse).toBe(0);
    expect(result.shift_budget_day.assistant).toBeCloseTo(72);
    expect(result.shift_budget.total).toBeCloseTo(72);
  });
  test('applies night multiplier', () => {
    const result = computeBudget({
      counts: {
        day: { doctor: 1, nurse: 0, assistant: 0 },
        night: { doctor: 1, nurse: 0, assistant: 0 },
      },
      rateInputs: {
        zoneCapacity: 1,
        patientCount: 0,
        maxCoefficient: 1,
        baseDoc: 10,
        baseNurse: 0,
        baseAssist: 0,
        shiftH: 1,
        monthH: 1,
        n1: 0,
        n2: 0,
        n3: 0,
        n4: 0,
        n5: 0,
      },
    });

    expect(result.shift_budget_day.doctor).toBeCloseTo(10);
    expect(result.shift_budget_night.doctor).toBeCloseTo(15);
    expect(result.shift_budget.doctor).toBeCloseTo(25);
    expect(result.month_budget_day.doctor).toBeCloseTo(10);
    expect(result.month_budget_night.doctor).toBeCloseTo(15);
    expect(result.month_budget.doctor).toBeCloseTo(25);
  });

  test('computes baseline and bonus budgets when zone coefficient > 1', () => {
    const result = computeBudget({
      counts: { doctor: 1, nurse: 0, assistant: 0 },
      rateInputs: {
        zoneCapacity: 1,
        patientCount: 2,
        maxCoefficient: 1.5,
        baseDoc: 10,
        baseNurse: 0,
        baseAssist: 0,
        shiftH: 1,
        monthH: 1,
        n1: 0,
        n2: 0,
        n3: 0,
        n4: 0,
        n5: 0,
      },
    });

    expect(result.baseline_shift_budget_day.doctor).toBeCloseTo(10);
    expect(result.baseline_month_budget_day.doctor).toBeCloseTo(10);
    expect(result.shift_bonus_day.doctor).toBeCloseTo(1.5);
    expect(result.shift_bonus.total).toBeCloseTo(1.5);
    expect(result.month_bonus_day.doctor).toBeCloseTo(1.5);
    expect(result.month_bonus.total).toBeCloseTo(1.5);
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
      <span id="docDayCount"></span>
      <span id="docNightCount"></span>
      <span id="nurseDayCount"></span>
      <span id="nurseNightCount"></span>
      <span id="assistDayCount"></span>
      <span id="assistNightCount"></span>
      <span id="docRate"></span>
      <span id="nurseRate"></span>
      <span id="assistRate"></span>
      <span id="docShiftDay"></span>
      <span id="docShiftNight"></span>
      <span id="docShiftTotal"></span>
      <span id="nurseShiftDay"></span>
      <span id="nurseShiftNight"></span>
      <span id="nurseShiftTotal"></span>
      <span id="assistShiftDay"></span>
      <span id="assistShiftNight"></span>
      <span id="assistShiftTotal"></span>
      <span id="docShiftBonusDay"></span>
      <span id="docShiftBonusNight"></span>
      <span id="docShiftBonusTotal"></span>
      <span id="nurseShiftBonusDay"></span>
      <span id="nurseShiftBonusNight"></span>
      <span id="nurseShiftBonusTotal"></span>
      <span id="assistShiftBonusDay"></span>
      <span id="assistShiftBonusNight"></span>
      <span id="assistShiftBonusTotal"></span>
      <span id="docMonthDay"></span>
      <span id="docMonthNight"></span>
      <span id="docMonthTotal"></span>
      <span id="nurseMonthDay"></span>
      <span id="nurseMonthNight"></span>
      <span id="nurseMonthTotal"></span>
      <span id="assistMonthDay"></span>
      <span id="assistMonthNight"></span>
      <span id="assistMonthTotal"></span>
      <span id="docMonthBonusDay"></span>
      <span id="docMonthBonusNight"></span>
      <span id="docMonthBonusTotal"></span>
      <span id="nurseMonthBonusDay"></span>
      <span id="nurseMonthBonusNight"></span>
      <span id="nurseMonthBonusTotal"></span>
      <span id="assistMonthBonusDay"></span>
      <span id="assistMonthBonusNight"></span>
      <span id="assistMonthBonusTotal"></span>
      <span id="shiftDayTotal"></span>
      <span id="shiftNightTotal"></span>
      <span id="shiftTotal"></span>
      <span id="shiftBonusDayTotal"></span>
      <span id="shiftBonusNightTotal"></span>
      <span id="shiftBonusTotal"></span>
      <span id="monthDayTotal"></span>
      <span id="monthNightTotal"></span>
      <span id="monthTotal"></span>
      <span id="monthBonusDayTotal"></span>
      <span id="monthBonusNightTotal"></span>
      <span id="monthBonusTotal"></span>
      <canvas id="budgetChart"></canvas>
    `;

    const canvas = document.getElementById('budgetChart');
    canvas.getContext = jest.fn(() => ({}));
    chartInstance = { data: { datasets: [{ data: [] }, { data: [] }] }, update: jest.fn() };
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
    const initial = computeBudget({
      counts: {
        day: { doctor: 1, nurse: 1, assistant: 1 },
        night: { doctor: 1, nurse: 1, assistant: 1 },
      },
      rateInputs,
    });
    expect(global.Chart).toHaveBeenCalledTimes(1);
    expect(chartInstance.data.datasets[0].data).toEqual([
      initial.baseline_month_budget.doctor,
      initial.baseline_month_budget.nurse,
      initial.baseline_month_budget.assistant,
    ]);
    expect(chartInstance.data.datasets[1].data).toEqual([
      initial.month_bonus.doctor,
      initial.month_bonus.nurse,
      initial.month_bonus.assistant,
    ]);

    chartInstance.update.mockClear();
    document.getElementById('countDocDay').value = '2';
    compute();
    const updated = computeBudget({
      counts: {
        day: { doctor: 2, nurse: 1, assistant: 1 },
        night: { doctor: 1, nurse: 1, assistant: 1 },
      },
      rateInputs,
    });
    expect(chartInstance.data.datasets[0].data).toEqual([
      updated.baseline_month_budget.doctor,
      updated.baseline_month_budget.nurse,
      updated.baseline_month_budget.assistant,
    ]);
    expect(chartInstance.data.datasets[1].data).toEqual([
      updated.month_bonus.doctor,
      updated.month_bonus.nurse,
      updated.month_bonus.assistant,
    ]);
    expect(chartInstance.update).toHaveBeenCalled();
  });
});
