jest.mock('../chart-utils.js', () => {
  const actual = jest.requireActual('../chart-utils.js');
  return {
    ...actual,
    createBudgetChart: jest.fn(() => ({})),
    updateBudgetChart: jest.fn(),
    createDayNightChart: jest.fn(() => ({})),
    updateDayNightChart: jest.fn(),
    createStaffChart: jest.fn(() => ({ data: { datasets: [{ data: [] }] }, update: jest.fn() })),
    updateStaffChart: jest.fn(),
  };
});

const inputIds = [
  'shiftHours','monthHours','baseRateDoc','baseRateNurse','baseRateAssist',
  'countDocDay','countDocNight','countNurseDay','countNurseNight','countAssistDay','countAssistNight',
  'zoneCapacity','patientCount','maxCoefficient','n1','n2','n3','n4','n5'
];
const cellIds = [
  'docDayCount','docNightCount','nurseDayCount','nurseNightCount','assistDayCount','assistNightCount',
  'docRate','nurseRate','assistRate','docShiftDay','docShiftNight','docShiftTotal',
  'docShiftBonusDay','docShiftBonusNight','docShiftBonusTotal',
  'nurseShiftDay','nurseShiftNight','nurseShiftTotal',
  'nurseShiftBonusDay','nurseShiftBonusNight','nurseShiftBonusTotal',
  'assistShiftDay','assistShiftNight','assistShiftTotal',
  'assistShiftBonusDay','assistShiftBonusNight','assistShiftBonusTotal',
  'docMonthDay','docMonthNight','docMonthTotal','docMonthBonusDay','docMonthBonusNight','docMonthBonusTotal',
  'nurseMonthDay','nurseMonthNight','nurseMonthTotal','nurseMonthBonusDay','nurseMonthBonusNight','nurseMonthBonusTotal',
  'assistMonthDay','assistMonthNight','assistMonthTotal','assistMonthBonusDay','assistMonthBonusNight','assistMonthBonusTotal',
  'shiftDayTotal','shiftNightTotal','shiftTotal','shiftBonusDayTotal','shiftBonusNightTotal','shiftBonusTotal',
  'monthDayTotal','monthNightTotal','monthTotal','monthBonusDayTotal','monthBonusNightTotal','monthBonusTotal'
];

function setupDOM(){
  let html = '';
  inputIds.forEach(id => { html += `<input id="${id}" />`; });
  cellIds.forEach(id => { html += `<div id="${id}"></div>`; });
  html += '<canvas id="budgetChart"></canvas>';
  html += '<canvas id="dayNightChart"></canvas>';
  html += '<canvas id="staffChart"></canvas>';
  document.body.innerHTML = html;
}

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
  jest.resetModules();
});

test('loads saved values from localStorage', () => {
  setupDOM();
  localStorage.setItem('budgetInputs', JSON.stringify({ shiftHours: '8', zoneCapacity: '3' }));
  require('../budget-ui.js');
  expect(document.getElementById('shiftHours').value).toBe('8');
  expect(document.getElementById('zoneCapacity').value).toBe('3');
});

test('saves inputs to localStorage on input', () => {
  setupDOM();
  require('../budget-ui.js');
  const zone = document.getElementById('zoneCapacity');
  zone.value = '5';
  zone.dispatchEvent(new Event('input'));
  const saved = JSON.parse(localStorage.getItem('budgetInputs'));
  expect(saved.zoneCapacity).toBe('5');
});

test('computes and updates staff chart with counts', () => {
  setupDOM();
  const { compute } = require('../budget-ui.js');
  const { updateStaffChart } = require('../chart-utils.js');

  document.getElementById('countDocDay').value = '1';
  document.getElementById('countDocNight').value = '2';
  document.getElementById('countNurseDay').value = '3';
  document.getElementById('countNurseNight').value = '4';
  document.getElementById('countAssistDay').value = '5';
  document.getElementById('countAssistNight').value = '6';

  compute();

  expect(updateStaffChart).toHaveBeenCalledWith(expect.anything(), {
    day: { doctor: 1, nurse: 3, assistant: 5 },
    night: { doctor: 2, nurse: 4, assistant: 6 },
  });
});

test('updates bonus fields with computed values', () => {
  setupDOM();
  const { compute } = require('../budget-ui.js');
  const { computeBudget } = require('../budget.js');

  document.getElementById('shiftHours').value = '12';
  document.getElementById('monthHours').value = '160';
  document.getElementById('baseRateDoc').value = '10';
  document.getElementById('baseRateNurse').value = '8';
  document.getElementById('baseRateAssist').value = '6';
  document.getElementById('countDocDay').value = '1';
  document.getElementById('countNurseDay').value = '1';
  document.getElementById('countAssistDay').value = '1';
  document.getElementById('zoneCapacity').value = '1';
  document.getElementById('patientCount').value = '2';
  document.getElementById('maxCoefficient').value = '2';
  document.getElementById('n1').value = '1';
  document.getElementById('n2').value = '1';
  document.getElementById('n3').value = '0';
  document.getElementById('n4').value = '0';
  document.getElementById('n5').value = '0';

  compute();

  const expected = computeBudget({
    counts: {
      day: { doctor: 1, nurse: 1, assistant: 1 },
      night: { doctor: 0, nurse: 0, assistant: 0 },
    },
    rateInputs: {
      zoneCapacity: 1,
      patientCount: 2,
      maxCoefficient: 2,
      baseDoc: 10,
      baseNurse: 8,
      baseAssist: 6,
      shiftH: 12,
      monthH: 160,
      n1: 1,
      n2: 1,
      n3: 0,
      n4: 0,
      n5: 0,
    }
  });

  const parse = s => Number(s.replace(/[^0-9,-]/g, '').replace(',', '.'));
  expect(parse(document.getElementById('docShiftBonusDay').textContent)).toBeCloseTo(expected.shift_bonus_day.doctor);
  expect(parse(document.getElementById('shiftBonusTotal').textContent)).toBeCloseTo(expected.shift_bonus.total);
  expect(parse(document.getElementById('monthBonusTotal').textContent)).toBeCloseTo(expected.month_bonus.total);
});

test('uses ESI counts when patientCount is zero', () => {
  setupDOM();
  const { compute } = require('../budget-ui.js');
  const { computeBudget } = require('../budget.js');

  document.getElementById('shiftHours').value = '12';
  document.getElementById('monthHours').value = '160';
  document.getElementById('baseRateDoc').value = '10';
  document.getElementById('baseRateNurse').value = '8';
  document.getElementById('baseRateAssist').value = '6';
  document.getElementById('countDocDay').value = '1';
  document.getElementById('zoneCapacity').value = '80';
  document.getElementById('patientCount').value = '0';
  document.getElementById('maxCoefficient').value = '1.3';
  document.getElementById('n1').value = '10';
  document.getElementById('n2').value = '20';
  document.getElementById('n3').value = '70';
  document.getElementById('n4').value = '0';
  document.getElementById('n5').value = '0';

  compute();

  const expected = computeBudget({
    counts: {
      day: { doctor: 1, nurse: 0, assistant: 0 },
      night: { doctor: 0, nurse: 0, assistant: 0 },
    },
    rateInputs: {
      zoneCapacity: 80,
      patientCount: 0,
      maxCoefficient: 1.3,
      baseDoc: 10,
      baseNurse: 8,
      baseAssist: 6,
      shiftH: 12,
      monthH: 160,
      n1: 10,
      n2: 20,
      n3: 70,
      n4: 0,
      n5: 0,
    }
  });

  const parse = s => Number(s.replace(/[^0-9,-]/g, '').replace(',', '.'));
  expect(parse(document.getElementById('docRate').textContent)).toBeCloseTo(expected.final_rates.doctor);
  expect(parse(document.getElementById('shiftBonusTotal').textContent)).toBeGreaterThan(0);
});
