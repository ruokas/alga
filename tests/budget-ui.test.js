const inputIds = [
  'shiftHours','monthHours','baseRateDoc','baseRateNurse','baseRateAssist',
  'countDocDay','countDocNight','countNurseDay','countNurseNight','countAssistDay','countAssistNight'
];
const cellIds = [
  'countDocDayCell','countDocNightCell','countNurseDayCell','countNurseNightCell','countAssistDayCell','countAssistNightCell',
  'rateDocCell','rateNurseCell','rateAssistCell','shiftDocDayCell','shiftDocNightCell','shiftDocCell','shiftNurseDayCell',
  'shiftNurseNightCell','shiftNurseCell','shiftAssistDayCell','shiftAssistNightCell','shiftAssistCell','monthDocDayCell',
  'monthDocNightCell','monthDocCell','monthNurseDayCell','monthNurseNightCell','monthNurseCell','monthAssistDayCell',
  'monthAssistNightCell','monthAssistCell','shiftDayTotalCell','shiftNightTotalCell','shiftTotalCell','monthDayTotalCell',
  'monthNightTotalCell','monthTotalCell'
];

function setupDOM(){
  let html = '';
  inputIds.forEach(id => { html += `<input id="${id}" />`; });
  cellIds.forEach(id => { html += `<div id="${id}"></div>`; });
  html += '<canvas id="budgetChart"></canvas>';
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
