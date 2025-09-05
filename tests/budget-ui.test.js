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
  'countDocDay','countDocNight','countNurseDay','countNurseNight','countAssistDay','countAssistNight'
];
const cellIds = [
  'docDayCount','docNightCount','nurseDayCount','nurseNightCount','assistDayCount','assistNightCount',
  'docRate','nurseRate','assistRate','docShiftDay','docShiftNight','docShiftTotal','nurseShiftDay',
  'nurseShiftNight','nurseShiftTotal','assistShiftDay','assistShiftNight','assistShiftTotal','docMonthDay',
  'docMonthNight','docMonthTotal','nurseMonthDay','nurseMonthNight','nurseMonthTotal','assistMonthDay',
  'assistMonthNight','assistMonthTotal','shiftDayTotal','shiftNightTotal','shiftTotal','monthDayTotal',
  'monthNightTotal','monthTotal'
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
  localStorage.setItem('budgetInputs', JSON.stringify({ shiftHours: '8', monthHours: '160' }));
  require('../budget-ui.js');
  expect(document.getElementById('shiftHours').value).toBe('8');
  expect(document.getElementById('monthHours').value).toBe('160');
});

test('saves inputs to localStorage on input', () => {
  setupDOM();
  require('../budget-ui.js');
  const shift = document.getElementById('shiftHours');
  shift.value = '12';
  shift.dispatchEvent(new Event('input'));
  const saved = JSON.parse(localStorage.getItem('budgetInputs'));
  expect(saved.shiftHours).toBe('12');
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
